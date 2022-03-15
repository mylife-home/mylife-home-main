import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTabPanelId } from '../../../lib/tab-panel';
import { AppState } from '../../../../store/types';
import { getComponent, getPlugin, getSelectedComponent } from '../../../../store/core-designer/selectors';

export function useComponentData() {
  const tabId = useTabPanelId();
  const selectedComponent = useSelector(useCallback((state: AppState) => getSelectedComponent(state, tabId), [tabId]));
  const component = useSelector(useCallback((state: AppState) => getComponent(state, tabId, selectedComponent), [tabId, selectedComponent]));
  const plugin = useSelector(useCallback((state: AppState) => getPlugin(state, tabId, component.plugin), [tabId, component.plugin]));
  return { component, plugin };
}
