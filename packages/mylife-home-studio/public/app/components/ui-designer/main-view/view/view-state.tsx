import React, { FunctionComponent, createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeUniqueId } from '../../../lib/make-unique-id';
import { AppState } from '../../../../store/types';
import { setWindowProperties, setTemplateProperties, newControl, newTemplateInstance, setControlProperties, cloneControl, clearControl, renameControl, clearTemplateInstance, renameTemplateInstance, cloneTemplateInstance, setTemplateInstanceProperties } from '../../../../store/ui-designer/actions';
import { getControl, getView, getWindow, getTemplate, getControlsMap, getTemplateInstancesMap, getTemplateInstance } from '../../../../store/ui-designer/selectors';
import { UiWindow, UiTemplate, UiControl, UiViewType, UiTemplateInstance } from '../../../../store/ui-designer/types';
import { Position } from './canvas/types';

export type SelectionType = 'view' | 'control' | 'template-instance';
type Selection = { type: SelectionType; id: string; };

interface ContextProps {
  viewType: UiViewType;
  viewId: string;

  selection: Selection;
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
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
  const [selection, setSelection] = useState<Selection>({ type: 'view', id: null });

  // reset selection on view change (= switch to another view)
  useEffect(() => { setSelection({ type: 'view', id: null }); }, [viewType, viewId]);

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

  const selected = selection.type === 'view';
  const select = useCallback(() => setSelection({ type: 'view', id: null }), [setSelection]);

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

  const selected = selection.type === 'view';
  const select = useCallback(() => setSelection({ type: 'view', id: null }), [setSelection]);

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

  const selected = selection.type === 'view';
  const select = useCallback(() => setSelection({ type: 'view', id: null }), [setSelection]);

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
    setSelection({ type: 'control', id: newFullId });
  }, [dispatch, viewType, viewId, id, control.controlId, getExistingControlNames]);

  const rename = useCallback((newId: string) => {
    dispatch(renameControl({ controlId: id, newId }));
    const newFullId = `${viewId}:${viewType}:${newId}`;
    setSelection({ type: 'control', id: newFullId });
  }, [dispatch, viewType, viewId, id, setSelection]);

  const remove = useCallback(() => {
    dispatch(clearControl({ controlId: id }));
    setSelection({ type: 'view', id: null });
  }, [dispatch, id, setSelection]);

  const selected = selection.type === 'control' && selection.id === id;
  const select = useCallback(() => setSelection({ type: 'control', id }), [setSelection]);

  return { control, update, duplicate, rename, remove, selected, select };
}

export function useTemplateInstanceState(id: string) {
  const { viewType, viewId, selection, setSelection } = useContext(Context);
  const templateInstance = useSelector((state: AppState) => getTemplateInstance(state, id));
  const dispatch = useDispatch();
  const getExistingTemplateInstanceNames = useGetExistingTemplateInstanceNames();

  const update = useCallback((properties: Partial<Omit<UiTemplateInstance, 'id' | 'templateInstanceId'>>) => {
    dispatch(setTemplateInstanceProperties({ templateInstanceId: id, properties }));
  }, [dispatch, id]);

  const duplicate = useCallback(() => {
    const existingNames = getExistingTemplateInstanceNames();
    const newId = makeUniqueId(existingNames, templateInstance.templateInstanceId);
    dispatch(cloneTemplateInstance({ templateInstanceId: id, newId }));
    const newFullId = `${viewId}:${viewType}:${newId}`;
    setSelection({ type: 'template-instance', id: newFullId });
  }, [dispatch, viewType, viewId, id, templateInstance.templateInstanceId, getExistingTemplateInstanceNames]);

  const rename = useCallback((newId: string) => {
    dispatch(renameTemplateInstance({ templateInstanceId: id, newId }));
    const newFullId = `${viewId}:${viewType}:${newId}`;
    setSelection({ type: 'template-instance', id: newFullId });
  }, [dispatch, viewType, viewId, id, setSelection]);

  const remove = useCallback(() => {
    dispatch(clearTemplateInstance({ templateInstanceId: id }));
    setSelection({ type: 'view', id: null });
  }, [dispatch, id, setSelection]);

  const selected = selection.type === 'template-instance' && selection.id === id;
  const select = useCallback(() => setSelection({ type: 'template-instance', id }), [setSelection]);

  return { templateInstance, update, duplicate, rename, remove, selected, select };
}

export function useSelection() {
  const { selection } = useContext(Context);
  return selection;
}

export function useCreateControl(type: 'display' | 'text') {
  const { viewType, viewId, setSelection } = useContext(Context);
  const dispatch = useDispatch();
  const getExistingControlNames = useGetExistingControlNames();
  
  return useCallback((position: Position) => {
    const existingNames = getExistingControlNames();
    const newId = makeUniqueId(existingNames, 'new-control');
    const { x, y } = position;

    dispatch(newControl({ viewType, viewId, newId, x, y, type }));
    const newFullId = `${viewId}:${viewType}:${newId}`;
    setSelection({ type: 'control', id: newFullId });
  }, [dispatch, viewType, viewId, type, getExistingControlNames]);
}

export function useCreateTemplateInstance(templateId: string) {
  const { viewType, viewId, setSelection } = useContext(Context);
  const dispatch = useDispatch();
  const getExistingTemplateInstanceNames = useGetExistingTemplateInstanceNames();
  
  return useCallback((position: Position) => {
    const existingNames = getExistingTemplateInstanceNames();
    const newId = makeUniqueId(existingNames, 'new-template');
    const { x, y } = position;

    dispatch(newTemplateInstance({ viewType, viewId, newId, x, y, templateId }));
    const newFullId = `${viewId}:${viewType}:${newId}`;
    setSelection({ type: 'template-instance', id: newFullId });
  }, [dispatch, viewType, viewId, templateId, getExistingTemplateInstanceNames]);
}

export function useSelectableElementList() {
  const { viewType, viewId, setSelection } = useContext(Context);
  const view = useSelector((state: AppState) => getView(state, viewType, viewId));
  const controlsMap = useSelector(getControlsMap);
  const templateInstancesMap = useSelector(getTemplateInstancesMap);

  const elementsList = useMemo(() => {
    const items = [
      ...view.controls.map(id => ({ id: `control:${id}`, label: controlsMap[id].controlId })),
      ...view.templates.map(id => ({ id:`template-instance:${id}`, label: templateInstancesMap[id].templateInstanceId }))
    ];

    // check for duplicate labels and add suffix
    const map = new Map<string, { id: string; label: string }[]>();
    for (const item of items) {
      let list = map.get(item.label);
      if (!list) {
        list = [];
        map.set(item.label, list);
      }

      list.push(item);
    }

    for (const list of map.values()) {
      if (list.length > 1) {
        for (const item of list) {
          if (item.id.startsWith('control:')) {
            item.label += ' (Contrôle)';
          } else if (item.id.startsWith('template-instance:')) {
            item.label += ' (Template)';
          }
        }
      }
    }

    items.sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      } else if ( a.label > b.label) {
        return 1;
      } else {
        return 0;
      }
    });

    return items;
    
  }, [view.controls, view.templates, controlsMap, templateInstancesMap]);

  const selectElement = useCallback((value: string) => {
    const sepPos = value.indexOf(':');
    if (sepPos < 0) {
      throw new Error(`Bad value: '${value}'`);
    }

    const type = value.substring(0, sepPos) as SelectionType;
    const id = value.substring(sepPos + 1);

    setSelection({ type, id });
  }, [setSelection]);

  return { elementsList, selectElement };
}

export function useViewType() {
  const { viewType } = useContext(Context);
  return viewType;
}

export function useViewId() {
  const { viewId } = useContext(Context);
  return viewId;
}
