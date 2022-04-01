import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTabPanelId } from '../../../lib/tab-panel';
import { AppState } from '../../../../store/types';
import { getComponent, getSelectedComponent, makeGetComponentDefinitionProperties } from '../../../../store/core-designer/selectors';

export function useComponentData() {
  const tabId = useTabPanelId();
  const getComponentDefinitionProperties = useMemo(() => makeGetComponentDefinitionProperties(), []);
  const selectedComponent = useSelector(useCallback((state: AppState) => getSelectedComponent(state, tabId), [tabId]));
  const component = useSelector(useCallback((state: AppState) => getComponent(state, selectedComponent), [selectedComponent]));
  const definition = useSelector(useCallback((state: AppState) => getComponentDefinitionProperties(state, component.definition), [component.definition]));
  return { component, definition };
}
