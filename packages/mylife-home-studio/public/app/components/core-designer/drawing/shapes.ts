import { CanvasTheme } from './theme';
import { Rectangle, Point } from './types';
import { GRID_STEP_SIZE } from './defs';

import { Component, Plugin, Binding } from '../../../store/core-designer/types';

export function computeComponentRect(theme: CanvasTheme, component: Component, plugin: Plugin): Rectangle {
  const TITLE_COUNT = 3;
  const stateCount = plugin.stateIds.length;
  const actionCount = plugin.actionIds.length;
  const configCount = component.external ? 0 :  plugin.configIds.length;
  const itemCount = TITLE_COUNT + stateCount + actionCount + configCount;

  return {
    x: component.position.x * GRID_STEP_SIZE,
    y: component.position.y * GRID_STEP_SIZE,
    height: itemCount * theme.component.boxHeight,
    width: theme.component.width,
  };
}

export function computeBindingAnchors(theme: CanvasTheme, binding: Binding, sourceComponent: Component, sourcePlugin: Plugin, targetComponent: Component, targetPlugin: Plugin) {
  const sourcePropIndex = 1 + sourcePlugin.stateIds.findIndex(value => value === binding.sourceState);
  const targetPropIndex = 1 + targetPlugin.stateIds.length + targetPlugin.actionIds.findIndex(value => value === binding.targetAction);

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

function makeAnchors(component: Component, propIndex: number, theme: CanvasTheme): Point[] {
  const y = component.position.y * GRID_STEP_SIZE + (propIndex + 0.5) * theme.component.boxHeight;
  return [
    { x: component.position.x * GRID_STEP_SIZE, y},
    { x: component.position.x * GRID_STEP_SIZE + theme.component.width, y},
  ];
}

function computeDistance(a: Point, b: Point) {
  const x = a.x - b.x;
  const y = a.y - b.y;
  
  return Math.sqrt(x * x + y * y);
}
