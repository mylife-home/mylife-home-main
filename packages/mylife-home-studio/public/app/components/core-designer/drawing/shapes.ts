import { CanvasTheme } from './theme';
import { Rectangle, Point } from './types';
import { GRID_STEP_SIZE } from './defs';

import * as schema from '../../../files/schema';

export function computeComponentRect(theme: CanvasTheme, component: schema.Component): Rectangle {
  return {
    x: component.x * GRID_STEP_SIZE,
    y: component.y * GRID_STEP_SIZE,
    height: (component.states.length + component.actions.length + 1) * theme.component.boxHeight,
    width: theme.component.width,
  };
}

export function computeBindingAnchors(theme: CanvasTheme, binding: schema.Binding, sourceComponent: schema.Component, targetComponent: schema.Component) {
  const sourcePropIndex = 1 + sourceComponent.states.findIndex(value => value === binding.sourceState);
  const targetPropIndex = 1 + targetComponent.states.length + targetComponent.actions.findIndex(value => value === binding.targetAction);

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
