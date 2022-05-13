import React, { FunctionComponent, createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeUniqueId } from '../../../lib/make-unique-id';
import { AppState } from '../../../../store/types';
import { setWindowProperties, setTemplateProperties, newControl, setControlProperties, cloneControl, clearControl, renameControl } from '../../../../store/ui-designer/actions';
import { getControl, getView, getWindow, getTemplate, getControlsMap } from '../../../../store/ui-designer/selectors';
import { UiWindow, UiTemplate, UiControl, UiViewType } from '../../../../store/ui-designer/types';
import { Position } from './canvas/types';

interface ContextProps {
  viewType: UiViewType;
  viewId: string;

  selection: string; // control id or null for view itself
  setSelection: React.Dispatch<React.SetStateAction<string>>;
}

const Context = createContext<ContextProps>(null);

export const ViewStateProvider: FunctionComponent<{ viewType: UiViewType; viewId: string; }> = ({ viewType, viewId, children }) => {
  const { selection, setSelection } = useSelectionFactory(viewType, viewId);
  const context: ContextProps = useMemo(() => ({ viewType, viewId, selection, setSelection }), [viewType, viewId, selection, setSelection]);

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
};

function useSelectionFactory(viewType: UiViewType, viewId: string) {
  const [selection, setSelection] = useState<string>(null);

  // reset selection on view change (= switch to another view)
  useEffect(() => { setSelection(null); }, [viewType, viewId]);

  return { selection, setSelection };
}

export function useGetExistingControlNames() {
  const { viewType, viewId } = useContext(Context);
  const view = useSelector((state: AppState) => getView(state, viewType, viewId));
  const controlsMap = useSelector(getControlsMap);

  return useCallback(() => new Set(view.controls.map(id => controlsMap[id].controlId)), [view.controls, controlsMap]);
}

export function useGetExistingTemplateInstanceNames() {
  const { viewType, viewId } = useContext(Context);
  const view = useSelector((state: AppState) => getView(state, viewType, viewId));
  const templateInstancesMap = useSelector(getTemplateInstancesMap);

  return useCallback(() => new Set(view.templates.map(id => templateInstancesMap[id].templateInstanceId)), [view.templates, templateInstancesMap]);
}

export function useViewState() {
  const { viewType, viewId, selection, setSelection } = useContext(Context);
  const view = useSelector((state: AppState) => getView(state, viewType, viewId));
  const dispatch = useDispatch();

  const resize = useCallback((size: { width: number; height: number; }) => {
    switch(viewType) {
      case 'window':
        return dispatch(setWindowProperties({ windowId: viewId, properties: size }));
      case 'template':
        return dispatch(setTemplateProperties({ templateId: viewId, properties: size }));
    }
  }, [dispatch, viewType, viewId]);

  const selected = selection === null;
  const select = useCallback(() => setSelection(null), [setSelection]);

  return { viewType, view, resize, selected, select };
}

export function useWindowState() {
  const { viewType, viewId, selection, setSelection } = useContext(Context);
  const window = useSelector((state: AppState) => getWindow(state, viewId));
  const dispatch = useDispatch();

  if (viewType !== 'window') {
    throw new Error('Wrong view type');
  }

  const update = useCallback((properties: Partial<Omit<UiWindow, 'id' | 'windowId' | 'controls'>>) => {
    dispatch(setWindowProperties({ windowId: viewId, properties }));
  }, [dispatch, viewId]);

  const selected = selection === null;
  const select = useCallback(() => setSelection(null), [setSelection]);

  return { window, update, selected, select };
}

export function useTemplateState() {
  const { viewType, viewId, selection, setSelection } = useContext(Context);
  const template = useSelector((state: AppState) => getTemplate(state, viewId));
  const dispatch = useDispatch();

  if (viewType !== 'template') {
    throw new Error('Wrong view type');
  }

  const update = useCallback((properties: Partial<Omit<UiTemplate, 'id' | 'templateId' | 'controls'>>) => {
    dispatch(setTemplateProperties({ templateId: viewId, properties }));
  }, [dispatch, viewId]);

  const selected = selection === null;
  const select = useCallback(() => setSelection(null), [setSelection]);

  return { template, update, selected, select };
}

export function useControlState(id: string) {
  const { viewType, viewId, selection, setSelection } = useContext(Context);
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
    const newFullId = `${viewId}:${viewType}:${newId}`;
    setSelection(newFullId);
  }, [dispatch, viewType, viewId, id, control.controlId, getExistingControlNames]);

  const rename = useCallback((newId: string) => {
    dispatch(renameControl({ controlId: id, newId }));
    const newFullId = `${viewId}:${viewType}:${newId}`;
    setSelection(newFullId);
  }, [dispatch, viewType, viewId, id, setSelection]);

  const remove = useCallback(() => {
    dispatch(clearControl({ controlId: id }));
    setSelection(null);
  }, [dispatch, id, setSelection]);

  const selected = selection === id;
  const select = useCallback(() => setSelection(id), [setSelection]);

  return { control, update, duplicate, rename, remove, selected, select };
}

export type SelectionType = 'control' | 'view';

export function useSelection() {
  const { selection } = useContext(Context);
  return useMemo(() => {
    const type: SelectionType = selection ? 'control' : 'view';
    return { type, id: selection };
  }, [selection]);
}

export function useCreateControl() {
  const { viewType, viewId, setSelection } = useContext(Context);
  const dispatch = useDispatch();
  const getExistingControlNames = useGetExistingControlNames();
  
  return useCallback((position: Position) => {
    const existingNames = getExistingControlNames();
    const newId = makeUniqueId(existingNames, 'new-control');
    const { x, y } = position;

    dispatch(newControl({ viewType, viewId, newId, x, y }));
    const newFullId = `${viewId}:${viewType}:${newId}`;
    setSelection(newFullId);
  }, [dispatch, viewType, viewId, getExistingControlNames]);
}

export function useSelectableControlList() {
  const { viewType, viewId, setSelection } = useContext(Context);
  const view = useSelector((state: AppState) => getView(state, viewType, viewId));
  const controlsMap = useSelector(getControlsMap);
  const controlsList = useMemo(() => view.controls.map(id => ({ id, label: controlsMap[id].controlId })), [view.controls, controlsMap]);
  return { controlsList, selectControl: setSelection };
}

export function useViewType() {
  const { viewType } = useContext(Context);
  return viewType;
}