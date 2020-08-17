import React, { FunctionComponent, useCallback, useRef, useEffect } from 'react';
import { Rect, Group } from 'react-konva';
import Konva from 'konva';

import { useCanvasTheme } from '../base/theme';
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

  const height = (states.length + actions.length + 1) * theme.gridStep;
  const width = theme.component.width;

  const dragBoundHandler = useCallback((pos: Konva.Vector2d) => {
    return {
      x: toPx(lockBetween(toGrid(pos.x), theme.layerSize - width / theme.gridStep)),
      y: toPx(lockBetween(toGrid(pos.y), theme.layerSize - height / theme.gridStep)),
    };

    function toGrid(value: number) {
      return Math.round(value / theme.gridStep);
    }
    
    function toPx(value: number) {
      return value * theme.gridStep;
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
    
  }, [theme, height, width]);

  const dragMoveHandler = useCallback((e: Konva.KonvaEventObject<DragEvent>) => onMove({ x: e.target.x() / theme.gridStep, y : e.target.y() / theme.gridStep }), [onMove, theme.gridStep]);

  return (
    <Group
      x={x * theme.gridStep}
      y={y * theme.gridStep}
      width={width}
      height={height}
      onClick={onSelect}
      draggable
      dragBoundFunc={dragBoundHandler}
      onDragStart={onSelect}
      onDragMove={dragMoveHandler}
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
