import React, { FunctionComponent } from 'react';
import { Rect } from 'react-konva';
import { useCanvasTheme } from '../base/theme';

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

  const height = (states.length + actions.length + 1) * theme.gridStep;
  const width = theme.component.width;

  return (
    <Rect
      x={x * theme.gridStep}
      y={y * theme.gridStep}
      width={width}
      height={height}
      fill={selected ? theme.borderColorSelected : theme.borderColor}
    />
  );
};

export default Component;
