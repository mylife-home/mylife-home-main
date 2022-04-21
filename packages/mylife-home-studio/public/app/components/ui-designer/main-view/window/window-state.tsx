import React, { FunctionComponent, createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTabPanelId } from '../../../lib/tab-panel';
import { makeUniqueId } from '../../../lib/make-unique-id';
import { AppState } from '../../../../store/types';
import { setWindowProperties, newControl, setControlProperties, cloneControl, clearControl, renameControl } from '../../../../store/ui-designer/actions';
import { getControl, getWindow, getControlsMap } from '../../../../store/ui-designer/selectors';
import { UiWindow, UiControl } from '../../../../store/ui-designer/types';
import { Position } from './canvas/types';

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
  const dispatch = useDispatch();

  const update = useCallback((properties: Partial<Omit<UiWindow, 'id' | 'windowId' | 'controls'>>) => {
    dispatch(setWindowProperties({ windowId, properties }));
  }, [dispatch, windowId]);

  const selected = selection === null;
  const select = useCallback(() => setSelection(null), [setSelection]);

  return { window, update, selected, select };
}

export function useControlState(id: string) {
  const { windowId, selection, setSelection } = useContext(Context);
  const control = useSelector((state: AppState) => getControl(state, id));
  const dispatch = useDispatch();
  const getExistingControlNames = useGetExistingControlNames();

  const update = useCallback((properties: Partial<Omit<UiControl, 'id' | 'controlId'>>) => {
    dispatch(setControlProperties({ controlId: id, properties }));
  }, [dispatch, id]);

  const duplicate = useCallback(() => {
    const existingNames = getExistingControlNames();
    const newId = makeUniqueId(existingNames, control.controlId);
    dispatch(cloneControl({ controlId: id, newId }));
    const newFullId = `${windowId}:${newId}`;
    setSelection(newFullId);
  }, [dispatch, windowId, id, control.controlId, getExistingControlNames]);

  const rename = useCallback((newId: string) => {
    dispatch(renameControl({ controlId: id, newId }));
    const newFullId = `${windowId}:${newId}`;
    setSelection(newFullId);
  }, [dispatch, windowId, id, setSelection]);

  const remove = useCallback(() => {
    dispatch(clearControl({ controlId: id }));
    setSelection(null);
  }, [dispatch, id, setSelection]);

  const selected = selection === id;
  const select = useCallback(() => setSelection(id), [setSelection]);

  return { control, update, duplicate, rename, remove, selected, select };
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
  const dispatch = useDispatch();
  const getExistingControlNames = useGetExistingControlNames();
  
  return useCallback((position: Position) => {
    const existingNames = getExistingControlNames();
    const newId = makeUniqueId(existingNames, 'new-control');
    const { x, y } = position;

    dispatch(newControl({ windowId, newId, x, y }));
    const newFullId = `${windowId}:${newId}`;
    setSelection(newFullId);
  }, [dispatch, windowId, getExistingControlNames]);
}

export function useSelectableControlList() {
  const { windowId, setSelection } = useContext(Context);
  const window = useSelector((state: AppState) => getWindow(state, windowId));
  const controlsMap = useSelector(getControlsMap);
  const controlsList = useMemo(() => window.controls.map(id => ({ id, label: controlsMap[id].controlId })), [window.controls, controlsMap]);
  return { controlsList, selectControl: setSelection };
}