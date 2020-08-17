import React, { FunctionComponent, useCallback } from 'react';
import { Rect, Group } from 'react-konva';

import { useCanvasTheme } from '../base/theme';
import Border from '../base/border';
import Title from './title';
import PropertyList from './property-list';
import { Vector2d } from 'konva/types/types';

export interface ComponentProps {
  id: string;
  x: number;
  y: number;
  selected?: boolean;
  title: string;
  states: string[];
  actions: string[];

  onSelect: () => void;
}

const Component: FunctionComponent<ComponentProps> = ({ x, y, title, states, actions, selected, onSelect }) => {
  const theme = useCanvasTheme();

  const height = (states.length + actions.length + 1) * theme.gridStep;
  const width = theme.component.width;

  const snapToGrid = useCallback((pos: Vector2d) => ({
    x: Math.round(pos.x / theme.gridStep) * theme.gridStep,
    y: Math.round(pos.y / theme.gridStep) * theme.gridStep,
  }), [theme.gridStep]);

  return (
    <Group
      x={x * theme.gridStep}
      y={y * theme.gridStep}
      width={width}
      height={height}
      onClick={onSelect}
      draggable
      dragBoundFunc={snapToGrid}
    >
      <Rect x={0} y={0} width={width} height={height} fill={theme.backgroundColor} />

      {selected && (
        <Border
          x={0}
          y={0}
          width={width}
          height={height}
          type='outer'
          color={theme.borderColorSelected}
          thickness={theme.selectionWidth}
        />
      )}

      <Title text={title} />
      <Border x={0} y={0} width={width} height={theme.gridStep} color={theme.borderColor} type='inner' />

      <PropertyList yIndex={1} icon='visibility' items={states} />
      <PropertyList yIndex={1 + states.length} icon='input' items={actions} />
    </Group>
  );
};

export default Component;