import React, { FunctionComponent, useCallback } from 'react';
import { Rect, Group } from 'react-konva';
import Konva from 'konva';

import { GRID_STEP_SIZE, LAYER_SIZE } from '../base/defs';
import { useCanvasTheme } from '../base/theme';
import CachedGroup from '../base/cached-group';
import Border from '../base/border';
import Title from './title';
import PropertyList from './property-list';

export interface ComponentProps {
  id: string;
  x: number;
  y: number;
  selected?: boolean;
  title: string;
  states: string[];
  actions: string[];

  onSelect: () => void;
  onMove: (pos: Konva.Vector2d) => void;
}

const Component: FunctionComponent<ComponentProps> = ({ x, y, title, states, actions, selected, onSelect, onMove }) => {
  const theme = useCanvasTheme();

  const height = (states.length + actions.length + 1) * theme.component.boxHeight;
  const width = theme.component.width;

  const dragBoundHandler = useCallback((pos: Konva.Vector2d) => ({
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
      onClick={onSelect}
      draggable
      dragBoundFunc={dragBoundHandler}
      onDragStart={onSelect}
      onDragMove={dragMoveHandler}
    >
      <CachedGroup x={0} y={0} width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={theme.backgroundColor} />
        <Title text={title} />
        <PropertyList yIndex={1} icon='visibility' items={states} />
        <PropertyList yIndex={1 + states.length} icon='input' items={actions} />
      </CachedGroup>

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
