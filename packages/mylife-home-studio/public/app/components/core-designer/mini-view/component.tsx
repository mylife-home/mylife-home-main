import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Rect } from '../drawing/konva';
import { useCanvasTheme } from '../drawing/theme';
import { computeComponentRect } from '../drawing/shapes';
import { useTabPanelId } from '../../lib/tab-panel';

import { AppState } from '../../../store/types';
import { getComponent, getPlugin } from '../../../store/core-designer/selectors';

export interface ComponentProps {
  componentId: string,
  selected?: boolean;
}

const Component: FunctionComponent<ComponentProps> = ({ componentId, selected }) => {
  const theme = useCanvasTheme();
  const { component, plugin } = useConnect(componentId);
  const rect = computeComponentRect(theme, component, plugin);

  return (
    <Rect
      {...rect}
      fill={selected ? theme.borderColorSelected : theme.borderColor}
    />
  );
};

export default Component;

function useConnect(componentId: string) {
  const tabId = useTabPanelId();
  const component = useSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  return { component, plugin };
}