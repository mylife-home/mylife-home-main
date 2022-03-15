import { useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTabPanelId } from '../lib/tab-panel';

import { AppState } from '../../store/types';
import { Selection, BindingSelection, MultiSelectionIds, ComponentsSelection } from '../../store/core-designer/types';
import { getSelection } from '../../store/core-designer/selectors';
import { select, toggleComponentSelection } from '../../store/core-designer/actions';

function useSelection() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  return {
    selection: useSelector((state: AppState) => getSelection(state, tabId)),
    ...useMemo(() => ({
      select: (selection: Selection) => dispatch(select({ id: tabId, selection })),
      toggleComponentSelection: (componentId: string) => dispatch(toggleComponentSelection({ id: tabId, componentId })),
    }), [tabId, dispatch])
  };
}

export function useSelectComponent() {
  const { select } = useSelection();

  return useCallback((componentId: string) => {
    const newSelection: ComponentsSelection = { type: 'components', ids: { [componentId]: true } };
    select(newSelection);
  }, [select]);
}

export function useSelectComponents() {
  const { select } = useSelection();

  return useCallback((componentsIds: string[]) => {
    const ids: MultiSelectionIds = {};
    for (const id of componentsIds) {
      ids[id] = true;
    }

    const newSelection: ComponentsSelection = { type: 'components', ids };
    select(newSelection);
  }, [select]);
}

export function useComponentSelection(componentId: string) {
  const { selection, select, toggleComponentSelection } = useSelection();

  return { 
    selected: !!getSelectedComponentsIds(selection)[componentId],

    select: useCallback(() => {
      const newSelection: ComponentsSelection = { type: 'components', ids: { [componentId]: true } };
      select(newSelection);
    }, [select, componentId]),

    toggle: useCallback(() => {
      toggleComponentSelection(componentId);
    }, [toggleComponentSelection, componentId])
  };
}

function getSelectedComponentsIds(selection: Selection): MultiSelectionIds {
  return selection?.type === 'components' ? (selection as ComponentsSelection).ids : {};
}

export function useBindingSelection(bindingId: string) {
  const { selection, select } = useSelection();

  return { 
    selected: selection?.type === 'binding' && (selection as BindingSelection).id === bindingId,
    select: useCallback(() => {
      const newSelection: BindingSelection = { type: 'binding', id: bindingId };
      select(newSelection);
    }, [select, bindingId])
  };
}
