import React, { FunctionComponent } from 'react';

import { useCanvasTheme } from '../drawing/theme';
import Border from '../drawing/border';
import { computeComponentRect } from '../drawing/shapes';
import { useMovableComponent } from '../component-move';

export interface ComponentSelectionMarkProps {
  componentId: string;
}

const ComponentSelectionMark: FunctionComponent<ComponentSelectionMarkProps> = ({ componentId }) => {
  const theme = useCanvasTheme();
  const { component, plugin } = useMovableComponent(componentId);

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
