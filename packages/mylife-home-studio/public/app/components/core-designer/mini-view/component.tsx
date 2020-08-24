import React, { FunctionComponent } from 'react';
import { Rect } from 'react-konva';
import { useCanvasTheme } from '../base/theme';
import { GRID_STEP_SIZE } from '../base/defs';

export interface ComponentProps {
  id: string;
  x: number;
  y: number;
  selected?: boolean;
  title: string;
  states: string[];
  actions: string[];
}

const Component: FunctionComponent<ComponentProps> = ({ x, y, title, states, actions, selected }) => {
  const theme = useCanvasTheme();

  const height = (states.length + actions.length + 1) * theme.component.boxHeight;
  const width = theme.component.width;

  return (
    <Rect
      x={x * GRID_STEP_SIZE}
      y={y * GRID_STEP_SIZE}
      width={width}
      height={height}
      fill={selected ? theme.borderColorSelected : theme.borderColor}
    />
  );
};

export default Component;
