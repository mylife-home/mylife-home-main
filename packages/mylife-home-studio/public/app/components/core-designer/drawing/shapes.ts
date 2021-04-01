import { CanvasTheme } from './theme';
import { Rectangle, Point } from './types';
import { GRID_STEP_SIZE, LAYER_SIZE } from './defs';

import { Component, Plugin, Binding } from '../../../store/core-designer/types';

const TITLE_COUNT = 3; // component id + instance + plugin

export function computeComponentRect(theme: CanvasTheme, component: Component, plugin: Plugin): Rectangle {
  const configCount = component.external ? 0 :  plugin.configIds.length;
  const stateCount = plugin.stateIds.length;
  const actionCount = plugin.actionIds.length;
  const itemCount = TITLE_COUNT + stateCount + actionCount + configCount;

  return {
    x: component.position.x * GRID_STEP_SIZE,
    y: component.position.y * GRID_STEP_SIZE,
    height: itemCount * theme.component.boxHeight,
    width: theme.component.width,
  };
}

export function computeBindingAnchors(theme: CanvasTheme, binding: Binding, sourceComponent: Component, sourcePlugin: Plugin, targetComponent: Component, targetPlugin: Plugin) {
  const sourceHeaderCount = TITLE_COUNT + (sourceComponent.external ? 0 :  sourcePlugin.configIds.length);
  const targetHeaderCount = TITLE_COUNT + (targetComponent.external ? 0 :  targetPlugin.configIds.length);
  const sourcePropIndex = sourceHeaderCount + sourcePlugin.stateIds.findIndex(value => value === binding.sourceState);
  const targetPropIndex = targetHeaderCount + targetPlugin.stateIds.length + targetPlugin.actionIds.findIndex(value => value === binding.targetAction);

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

export function lockComponentPosition(componentRect: Rectangle, position: Point) {
  const result: Point = {
    x: lockBetween(snapToGrid(position.x, GRID_STEP_SIZE), LAYER_SIZE - componentRect.width),
    y: lockBetween(snapToGrid(position.y, GRID_STEP_SIZE), LAYER_SIZE - componentRect.height),
  };

  return result;
}

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