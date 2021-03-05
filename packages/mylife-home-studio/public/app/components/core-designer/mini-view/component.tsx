import React, { FunctionComponent } from 'react';

import { useTabPanelId } from '../../lib/tab-panel';
import { useComponentSelection } from '../selection';
import { Rect } from '../drawing/konva';
import { useCanvasTheme } from '../drawing/theme';
import { computeComponentRect } from '../drawing/shapes';
import { useSafeSelector } from '../drawing/use-safe-selector';

import { AppState } from '../../../store/types';
import { getComponent, getPlugin } from '../../../store/core-designer/selectors';

export interface ComponentProps {
  componentId: string;
}

const Component: FunctionComponent<ComponentProps> = ({ componentId }) => {
  const theme = useCanvasTheme();
  const { component, plugin } = useConnect(componentId);
  const { selected } = useComponentSelection(componentId);
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

function useConnect(componentId: string) {
  const tabId = useTabPanelId();
  const component = useSafeSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSafeSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  return { component, plugin };
}
