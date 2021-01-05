import React, { FunctionComponent, createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { useDebounced } from '../../../lib/use-debounced';
import { useTabPanelId } from '../../../lib/tab-panel';
import { setWindow } from '../../../../store/ui-designer/actions';
import { getWindow } from '../../../../store/ui-designer/selectors';
import { UiWindow, UiControl } from '../../../../store/ui-designer/types';

interface ContextProps {
  window: UiWindow;
  updateWindow: (callback: (prev: UiWindow) => UiWindow) => void;

  selection: string; // control id or null for window itself
  setSelection: React.Dispatch<React.SetStateAction<string>>;
}

const Context = createContext<ContextProps>(null);

export const WindowStateProvider: FunctionComponent<{ id: string; }> = ({ id, children }) => {
  const { window, updateWindow } = useWindowStateFactory(id);
  const { selection, setSelection } = useSelectionFactory(id);
  const context: ContextProps = useMemo(() => ({ window, updateWindow, selection, setSelection }), [window, updateWindow, selection, setSelection]);

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
};

function useWindowStateFactory(id: string) {
  const tabId = useTabPanelId();
  const window = useTabSelector((state, tabId) => getWindow(state, tabId, id));
  const dispatch = useDispatch();
  const persistWindow = useCallback(
    (window: UiWindow) => {
      dispatch(setWindow({ id: tabId, window }));
    },
    [dispatch]
  );

  const { componentValue, componentChange } = useDebounced(window, persistWindow);
  return { window: componentValue, updateWindow: componentChange };
};

function useSelectionFactory(windowId: string) {
  const [selection, setSelection] = useState<string>(null);

  // reset selection on window id change (= switch to another window)
  useEffect(() => { setSelection(null); }, [windowId]);

  return { selection, setSelection };
}

export function useWindowState() {
  const { window, updateWindow, selection, setSelection } = useContext(Context);

  const update = useCallback((props: Partial<UiWindow>) => {
    updateWindow((prev) => ({ ...prev, ...props }));
  }, [updateWindow]);

  const selected = selection === null;
  const select = useCallback(() => setSelection(null), [setSelection]);

  return { window, update, selected, select };
}

export function useControlState(id: string) {
  const { window, updateWindow, selection, setSelection } = useContext(Context);

  const index = useMemo(() => window.controls.findIndex(control => control.id === id), [window.controls, id]);
  const control = window.controls[index];

  const update = useCallback((props: Partial<UiControl>) => updateWindow(window => {
    const newWindow = { ...window, controls: window.controls.slice() };
    const control = window.controls[index];
    newWindow.controls[index] = { ...control, ...props };

    const newId = props.id;
    if (newId) {
      // update selection on rename
      setSelection(selection => selection === id ? newId : selection);
    }

    return newWindow;
  }), [id, setSelection, index]);

  const selected = selection === id;
  const select = useCallback(() => setSelection(id), [setSelection]);

  return { control, update, selected, select };
}
