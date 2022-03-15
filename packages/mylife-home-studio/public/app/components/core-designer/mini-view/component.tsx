import React, { FunctionComponent, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useComponentSelection } from '../selection';
import { Rect } from '../drawing/konva';
import { useCanvasTheme } from '../drawing/theme';
import { computeComponentRect } from '../drawing/shapes';
import { useComponentData } from '../component-move';
import { AppState } from '../../../store/types';
import { isComponentSelected } from '../../../store/core-designer/selectors';

export interface ComponentProps {
  componentId: string;
}

const Component: FunctionComponent<ComponentProps> = ({ componentId }) => {
  const theme = useCanvasTheme();
  const tabId = useTabPanelId();

  const { component, plugin } = useComponentData(componentId);
  const selected = useSelector(useCallback((state: AppState) => isComponentSelected(state, tabId, componentId), [tabId, componentId]));
  const rect = computeComponentRect(theme, component, plugin);
  const componentColor = component.external ? theme.borderColorExternal : theme.borderColor;

  return (
    <Rect
      {...rect}
      fill={selected ? theme.borderColorSelected : componentColor}
    />
  );
};

export default Component;
