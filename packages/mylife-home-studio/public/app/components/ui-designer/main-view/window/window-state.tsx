import React, { FunctionComponent, createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useDebounced } from '../../../lib/use-debounced';
import { useTabPanelId } from '../../../lib/tab-panel';
import { makeUniqueId } from '../../../lib/make-unique-id';
import { clone } from '../../../lib/clone';
import { AppState } from '../../../../store/types';
import { setWindow } from '../../../../store/ui-designer/actions';
import { getWindow } from '../../../../store/ui-designer/selectors';
import { UiWindow, UiControl } from '../../../../store/ui-designer/types';
import { createNewControl } from '../common/templates';
import { Position, Size } from './canvas/types';

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
  const window = useSelector((state: AppState) => getWindow(state, id));
  const dispatch = useDispatch();
  const persistWindow = useCallback(
    (window: UiWindow) => {
      dispatch(setWindow({ tabId, window }));
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

  const duplicate = useCallback(() => updateWindow(window => {
    const control = window.controls[index];
    const existingIds = new Set(window.controls.map(control => control.id));
    const newControl = clone(control);
    const newWindow = { ...window, controls: [...window.controls, newControl] };

    newControl.id = makeUniqueId(existingIds, control.id);
    newControl.x = control.x +10;
    newControl.y = control.y +10;

    setSelection(newControl.id);

    return newWindow;
  }), [id, setSelection, index]);

  const remove = useCallback(() => updateWindow(window => {
    const newWindow = { ...window, controls: window.controls.slice() };
    newWindow.controls.splice(index, 1);

    setSelection(null);

    return newWindow;
  }), [id, setSelection, index]);

  const selected = selection === id;
  const select = useCallback(() => setSelection(id), [setSelection]);

  return { control, update, duplicate, remove, selected, select };
}

export type SelectionType = 'control' | 'window';

export function useSelection() {
  const { selection } = useContext(Context);
  return useMemo(() => {
    const type: SelectionType = selection ? 'control' : 'window';
    return { type, id: selection };
  }, [selection]);
}

export function useCreateControl() {
  const { updateWindow, setSelection } = useContext(Context);
  
  return useCallback((position: Position, size: Size) => updateWindow(window => {
    const existingIds = new Set(window.controls.map(control => control.id));
    const newControl = createNewControl();
    newControl.id = makeUniqueId(existingIds, 'new-control');
    newControl.x = position.x;
    newControl.y = position.y;
    newControl.width = size.width;
    newControl.height = size.height;

    setSelection(newControl.id);

    return { ...window, controls: [...window.controls, newControl] };
  }), [updateWindow, setSelection]);
}

export function useSelectableControlList() {
  const { window, setSelection } = useContext(Context);
  const controlsIds = useMemo(() => window.controls.map(control => control.id), [window.controls]);
  return { controlsIds, selectControl: setSelection };
}