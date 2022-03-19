import React, { FunctionComponent, createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTabPanelId } from '../../../lib/tab-panel';
import { makeUniqueId } from '../../../lib/make-unique-id';
import { clone } from '../../../lib/clone';
import { AppState } from '../../../../store/types';
import { setWindow, setControl, clearControl } from '../../../../store/ui-designer/actions';
import { getControl, getWindow, getControlsMap } from '../../../../store/ui-designer/selectors';
import { UiWindow, UiControl } from '../../../../store/ui-designer/types';
import { createNewControl } from '../common/templates';
import { Position, Size } from './canvas/types';

interface ContextProps {
  windowId: string;

  selection: string; // control id or null for window itself
  setSelection: React.Dispatch<React.SetStateAction<string>>;
}

const Context = createContext<ContextProps>(null);

export const WindowStateProvider: FunctionComponent<{ id: string; }> = ({ id: windowId, children }) => {
  const { selection, setSelection } = useSelectionFactory(windowId);
  const context: ContextProps = useMemo(() => ({ windowId, selection, setSelection }), [windowId, selection, setSelection]);

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
};

function useSelectionFactory(windowId: string) {
  const [selection, setSelection] = useState<string>(null);

  // reset selection on window id change (= switch to another window)
  useEffect(() => { setSelection(null); }, [windowId]);

  return { selection, setSelection };
}

export function useGetExistingControlNames() {
  const { windowId } = useContext(Context);
  const window = useSelector((state: AppState) => getWindow(state, windowId));
  const controlsMap = useSelector(getControlsMap);

  return useCallback(() => new Set(window.controls.map(id => controlsMap[id].controlId)), [window.controls, controlsMap]);
}

export function useWindowState() {
  const { windowId, selection, setSelection } = useContext(Context);
  const window = useSelector((state: AppState) => getWindow(state, windowId));
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  const update = useCallback((props: Partial<UiWindow>) => {
    const newWindow = { ... window, ... props };
    dispatch(setWindow({ tabId, window: newWindow }));
  }, [dispatch, tabId, window]);

  const selected = selection === null;
  const select = useCallback(() => setSelection(null), [setSelection]);

  return { window, update, selected, select };
}

export function useControlState(id: string) {
  const { windowId, selection, setSelection } = useContext(Context);
  const control = useSelector((state: AppState) => getControl(state, id));
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const getExistingControlNames = useGetExistingControlNames();

  const update = useCallback((props: Partial<UiControl>) => {
    const newControl = { ...control, ...props };
    dispatch(setControl({ tabId, windowId, control: newControl }));
  }, [dispatch, tabId, windowId, control]);

  const duplicate = useCallback(() => {
    const existingNames = getExistingControlNames();
    const newControl = clone(control);
    newControl.controlId = makeUniqueId(existingNames, control.controlId);
    newControl.id = `${tabId}:${windowId}:${newControl.controlId}`;
    newControl.x = control.x +10;
    newControl.y = control.y +10;

    dispatch(setControl({ tabId, windowId, control: newControl }));

    setSelection(newControl.id);
    
  }, [dispatch, tabId, windowId, control, getExistingControlNames]);

  const remove = useCallback(() => {
    dispatch(clearControl({ controlId: id }));
    setSelection(null);
  }, [dispatch, id, setSelection]);

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
  const { windowId, setSelection } = useContext(Context);
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const getExistingControlNames = useGetExistingControlNames();
  
  return useCallback((position: Position, size: Size) => {
    const existingNames = getExistingControlNames();
    const newControl = createNewControl();
    newControl.controlId = makeUniqueId(existingNames, 'new-control');
    newControl.id = `${tabId}:${windowId}:${newControl.controlId}`;
    newControl.x = position.x;
    newControl.y = position.y;
    newControl.width = size.width;
    newControl.height = size.height;

    dispatch(setControl({ tabId, windowId, control: newControl }));

    setSelection(newControl.id);
    
  }, [dispatch, tabId, windowId, getExistingControlNames]);
}

export function useSelectableControlList() {
  const { windowId, setSelection } = useContext(Context);
  const window = useSelector((state: AppState) => getWindow(state, windowId));
  const controlsMap = useSelector(getControlsMap);
  const controlsList = useMemo(() => window.controls.map(id => ({ id, label: controlsMap[id].controlId })), [window.controls, controlsMap]);
  return { controlsList, selectControl: setSelection };
}