import React, { FunctionComponent, useMemo } from 'react';

import { Arrow } from './base/konva';
import { GRID_STEP_SIZE } from './base/defs';
import { useCanvasTheme, CanvasTheme } from './base/theme';
import { Point } from './base/types';

import * as schema from '../../files/schema';

export interface BindingProps {
  sourceComponent: schema.Component;
  targetComponent: schema.Component;
  sourceState: string;
  targetAction: string;
  selected?: boolean;

  onSelect: () => void;
}

const Binding: FunctionComponent<BindingProps> = ({ sourceComponent, targetComponent, sourceState, targetAction, selected, onSelect }) => {
  const { sourceAnchor, targetAnchor } = useAnchors(sourceComponent, targetComponent, sourceState, targetAction);
  const theme = useCanvasTheme();

  const color = selected ? theme.borderColorSelected : theme.color;

  return (
    <Arrow
      fill={color}
      stroke={color}
      points={[sourceAnchor.x, sourceAnchor.y, targetAnchor.x, targetAnchor.y]}
      onClick={onSelect}
      pointerLength={theme.binding.pointerLength}
      pointerWidth={theme.binding.pointerWidth}
      strokeWidth={theme.binding.strokeWidth}
      hitStrokeWidth={GRID_STEP_SIZE}
    />
  );
};

export default Binding;

function useAnchors(sourceComponent: schema.Component, targetComponent: schema.Component, sourceState: string, targetAction: string) {
  const theme = useCanvasTheme();

  return useMemo(() => {
    const sourcePropIndex = 1 + sourceComponent.states.findIndex(value => value === sourceState);
    const targetPropIndex = 1 + targetComponent.states.length + targetComponent.actions.findIndex(value => value === targetAction);

    const sourceAnchors = makeAnchors(sourceComponent, sourcePropIndex, theme);
    const targetAnchors = makeAnchors(targetComponent, targetPropIndex, theme);

    let minDistance = Infinity;
    let sourceAnchor: Point;
    let targetAnchor: Point;

    for (const source of sourceAnchors) {
      for (const target of targetAnchors) {
        const distance = computeDistance(source, target);
        if (distance >= minDistance) {
          continue;
        }

        minDistance = distance;
        sourceAnchor = source;
        targetAnchor = target;
      }
    }
    
    return { sourceAnchor, targetAnchor };

  }, [theme, sourceComponent.x, sourceComponent.y, targetComponent.x, targetComponent.y, sourceComponent.id, targetComponent.id, sourceState, targetAction]);
}

function makeAnchors(component: schema.Component, propIndex: number, theme: CanvasTheme): Point[] {
  const y = component.y * GRID_STEP_SIZE + (propIndex + 0.5) * theme.component.boxHeight;
  return [
    { x: component.x * GRID_STEP_SIZE, y},
    { x: component.x * GRID_STEP_SIZE + theme.component.width, y},
  ];
}

function computeDistance(a: Point, b: Point) {
  const x = a.x - b.x;
  const y = a.y - b.y;
  
  return Math.sqrt(x * x + y * y);
}
