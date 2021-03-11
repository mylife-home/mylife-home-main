import React, { FunctionComponent } from 'react';

import { useTabPanelId } from '../../lib/tab-panel';
import { useCanvasTheme } from '../drawing/theme';
import Border from '../drawing/border';
import { computeComponentRect } from '../drawing/shapes';
import { useSafeSelector } from '../drawing/use-safe-selector';

import { AppState } from '../../../store/types';
import { getComponent, getPlugin } from '../../../store/core-designer/selectors';

export interface ComponentSelectionMarkProps {
  componentId: string;
}

const ComponentSelectionMark: FunctionComponent<ComponentSelectionMarkProps> = ({ componentId }) => {
  const theme = useCanvasTheme();
  const { component, plugin } = useConnect(componentId);

  // Appear after deletion/disconnection, select(null) already handled in toolbox management
  if(!component) {
    return null;
  }

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
  const component = useSafeSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSafeSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  return { component, plugin };
}
