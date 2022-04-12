import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTabPanelId } from '../lib/tab-panel';

import { AppState } from '../../store/types';
import { Selection, BindingSelection, MultiSelectionIds, ComponentsSelection } from '../../store/core-designer/types';
import { getSelection } from '../../store/core-designer/selectors';
import { select, toggleComponentSelection, selectComponent } from '../../store/core-designer/actions';

function useSelection() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  return {
    selection: useSelector((state: AppState) => getSelection(state, tabId)),
    ...useMemo(() => ({
      select: (selection: Selection) => dispatch(select({ tabId, selection })),
      selectComponent: (componentId: string) => dispatch(selectComponent({ tabId, componentId })),
      toggleComponentSelection: (componentId: string) => dispatch(toggleComponentSelection({ tabId, componentId })),
    }), [tabId, dispatch])
  };
}

export function useAddComponentToSelection() {
  const { selectComponent } = useSelection();
  return selectComponent;
}

export function useSelectComponent() {
  const { select } = useSelection();

  return useCallback((componentId: string) => {
    const newSelection: ComponentsSelection = { type: 'components', ids: { [componentId]: true } };
    select(newSelection);
  }, [select]);
}

export function useToggleComponent() {
  const { toggleComponentSelection } = useSelection();
  return toggleComponentSelection;
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

export function useSelectBinding() {
  const { select } = useSelection();

  return useCallback((bindingId: string) => {
    const newSelection: BindingSelection = { type: 'binding', id: bindingId };
    select(newSelection);
  }, [select]);
}
