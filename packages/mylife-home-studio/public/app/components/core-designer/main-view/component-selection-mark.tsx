import React, { FunctionComponent } from 'react';

import { GRID_STEP_SIZE } from '../drawing/defs';
import { useCanvasTheme } from '../drawing/theme';
import Border from '../drawing/border';

export interface ComponentSelectionMarkProps {
  x: number;
  y: number;
  states: string[];
  actions: string[];
}

const ComponentSelectionMark: FunctionComponent<ComponentSelectionMarkProps> = ({ x, y, states, actions }) => {
  const theme = useCanvasTheme();

  const height = (states.length + actions.length + 1) * theme.component.boxHeight;
  const width = theme.component.width;

  return (
    <Border
      x={x * GRID_STEP_SIZE}
      y={y * GRID_STEP_SIZE}
      width={width}
      height={height}
      type='outer'
      color={theme.borderColorSelected}
      thickness={theme.selectionWidth}
    />
  );
};

export default ComponentSelectionMark;
