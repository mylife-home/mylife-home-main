import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useCanvasTheme } from '../drawing/theme';
import Border from '../drawing/border';

import { AppState } from '../../../store/types';
import { getComponent, getPlugin } from '../../../store/core-designer/selectors';
import { computeComponentRect } from '../drawing/shapes';

export interface ComponentSelectionMarkProps {
  componentId: string;
}

const ComponentSelectionMark: FunctionComponent<ComponentSelectionMarkProps> = ({ componentId }) => {
  const theme = useCanvasTheme();
  const { component, plugin } = useConnect(componentId);
  const rect = computeComponentRect(theme, component, plugin);

  return (
    <Border
      {...rect}
      type='outer'
      color={theme.borderColorSelected}
      thickness={theme.selectionWidth}
    />
  );
};

export default ComponentSelectionMark;

function useConnect(componentId: string) {
  const tabId = useTabPanelId();
  const component = useSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  return { component, plugin };
}
