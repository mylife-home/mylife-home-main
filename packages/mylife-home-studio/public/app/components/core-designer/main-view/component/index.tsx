import React, { FunctionComponent, useCallback } from 'react';

import { Konva, Rect, Group } from '../../drawing/konva';
import { GRID_STEP_SIZE, LAYER_SIZE } from '../../drawing/defs';
import { Point } from '../../drawing/types';
import { useCanvasTheme } from '../../drawing/theme';
import CachedGroup from '../../drawing/cached-group';
import Title from './title';
import PropertyList from './property-list';

export interface ComponentProps {
  id: string;
  x: number;
  y: number;
  title: string;
  states: string[];
  actions: string[];

  onSelect: () => void;
  onMove: (pos: Point) => void;
}

const Component: FunctionComponent<ComponentProps> = ({ x, y, title, states, actions, onSelect, onMove }) => {
  const theme = useCanvasTheme();

  const height = (states.length + actions.length + 1) * theme.component.boxHeight;
  const width = theme.component.width;

  const dragBoundHandler = useCallback((pos: Point) => ({
    x: lockBetween(snapToGrid(pos.x, GRID_STEP_SIZE), LAYER_SIZE - width),
    y: lockBetween(snapToGrid(pos.y, GRID_STEP_SIZE), LAYER_SIZE - height),
  }), [theme, height, width]);

  const dragMoveHandler = useCallback((e: Konva.KonvaEventObject<DragEvent>) => onMove({ x: e.target.x() / GRID_STEP_SIZE, y : e.target.y() / GRID_STEP_SIZE }), [onMove, GRID_STEP_SIZE]);

  return (
    <Group
      x={x * GRID_STEP_SIZE}
      y={y * GRID_STEP_SIZE}
      width={width}
      height={height}
      onMouseDown={onSelect}
      draggable
      dragBoundFunc={dragBoundHandler}
      onDragMove={dragMoveHandler}
    >
      <CachedGroup x={0} y={0} width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={theme.backgroundColor} />
        <Title text={title} />
        <PropertyList yIndex={1} icon='visibility' items={states} />
        <PropertyList yIndex={1 + states.length} icon='input' items={actions} />
      </CachedGroup>
    </Group>
  );
};

export default Component;

function snapToGrid(value: number, gridStep: number) {
  return Math.round(value / gridStep) * gridStep;
}

function lockBetween(value: number, max: number) {
  if (value < 0) {
    return 0;
  }

  if (value > max) {
    return max;
  }
  
  return value;
}