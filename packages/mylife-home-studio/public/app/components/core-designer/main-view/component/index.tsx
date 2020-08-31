import React, { FunctionComponent, useCallback } from 'react';

import { Konva, Rect, Group } from '../../drawing/konva';
import { GRID_STEP_SIZE, LAYER_SIZE } from '../../drawing/defs';
import { Point } from '../../drawing/types';
import { useCanvasTheme } from '../../drawing/theme';
import CachedGroup from '../../drawing/cached-group';
import { computeComponentRect } from '../../drawing/shapes';
import Title from './title';
import PropertyList from './property-list';

import * as schema from '../../../../files/schema';

export interface ComponentProps {
  component: schema.Component;

  onSelect: () => void;
  onMove: (pos: Point) => void;
}

const Component: FunctionComponent<ComponentProps> = ({ component, onSelect, onMove }) => {
  const theme = useCanvasTheme();
  const rect = computeComponentRect(theme, component);

  const dragBoundHandler = useCallback((pos: Point) => ({
    x: lockBetween(snapToGrid(pos.x, GRID_STEP_SIZE), LAYER_SIZE - rect.width),
    y: lockBetween(snapToGrid(pos.y, GRID_STEP_SIZE), LAYER_SIZE - rect.height),
  }), [theme, rect.height, rect.width]);

  const dragMoveHandler = useCallback((e: Konva.KonvaEventObject<DragEvent>) => onMove({ x: e.target.x() / GRID_STEP_SIZE, y : e.target.y() / GRID_STEP_SIZE }), [onMove, GRID_STEP_SIZE]);

  return (
    <Group
      {...rect}
      onMouseDown={onSelect}
      draggable
      dragBoundFunc={dragBoundHandler}
      onDragMove={dragMoveHandler}
    >
      <CachedGroup x={0} y={0} width={rect.width} height={rect.height}>
        <Rect x={0} y={0} width={rect.width} height={rect.height} fill={theme.backgroundColor} />
        <Title text={component.id} />
        <PropertyList yIndex={1} icon='visibility' items={component.states} />
        <PropertyList yIndex={1 + component.states.length} icon='input' items={component.actions} />
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
