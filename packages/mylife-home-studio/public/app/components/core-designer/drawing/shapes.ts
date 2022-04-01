import { CanvasTheme } from './theme';
import { Rectangle, Point } from './types';
import { GRID_STEP_SIZE, LAYER_SIZE } from './defs';

import { Component, Binding, ComponentDefinitionProperties } from '../../../store/core-designer/types';

const TITLE_COUNT = 3; // component id + instance + plugin

export function computeComponentRect(theme: CanvasTheme, component: Component, properties: ComponentDefinitionProperties): Rectangle {
  const configCount = component.external ? 0 :  properties.configIds.length;
  const stateCount = properties.stateIds.length;
  const actionCount = properties.actionIds.length;
  const itemCount = TITLE_COUNT + stateCount + actionCount + configCount;

  return {
    x: component.position.x * GRID_STEP_SIZE,
    y: component.position.y * GRID_STEP_SIZE,
    height: itemCount * theme.component.boxHeight,
    width: theme.component.width,
  };
}

export function computeMemberRect(theme: CanvasTheme, component: Component, properties: ComponentDefinitionProperties, memberName: string) {
  const propIndex = getPropIndex(component, properties, memberName);
  
  return {
    x: component.position.x * GRID_STEP_SIZE,
    y:  component.position.y * GRID_STEP_SIZE + propIndex * theme.component.boxHeight,
    height: theme.component.boxHeight,
    width: theme.component.width,
  };
}

export function computeBindingAnchors(theme: CanvasTheme, binding: Binding, sourceComponent: Component, sourceProperties: ComponentDefinitionProperties, targetComponent: Component, targetProperties: ComponentDefinitionProperties) {
  const sourceHeaderCount = TITLE_COUNT + (sourceComponent.external ? 0 : sourceProperties.configIds.length);
  const targetHeaderCount = TITLE_COUNT + (targetComponent.external ? 0 : targetProperties.configIds.length);
  const sourcePropIndex = sourceHeaderCount + sourceProperties.stateIds.findIndex(value => value === binding.sourceState);
  const targetPropIndex = targetHeaderCount + targetProperties.stateIds.length + targetProperties.actionIds.findIndex(value => value === binding.targetAction);

  const sourceAnchors = makeAnchors(sourceComponent, sourcePropIndex, theme);
  const targetAnchors = makeAnchors(targetComponent, targetPropIndex, theme);

  let minDistance = Infinity;
  let sourceAnchor: Point;
  let targetAnchor: Point;

  for (const source of sourceAnchors) {
    for (const target of targetAnchors) {
      const distance = computeDistance(source, target);
      if (distance < minDistance) {
        minDistance = distance;
        sourceAnchor = source;
        targetAnchor = target;
      }
    }
  }
  
  return { sourceAnchor, targetAnchor };
}

export function computeBindingDndAnchor(theme: CanvasTheme, component: Component, properties: ComponentDefinitionProperties, memberName: string, mousePosition: Point) {
  const propIndex = getPropIndex(component, properties, memberName);
  const sourceAnchors = makeAnchors(component, propIndex, theme);

  let minDistance = Infinity;
  let anchor: Point;

  for (const source of sourceAnchors) {
    const distance = computeDistance(source, mousePosition);
    if (distance < minDistance) {
      minDistance = distance;
      anchor = source;
    }
  }

  return anchor;
}

function getPropIndex(component: Component, properties: ComponentDefinitionProperties, memberName: string) {
  const headerCount = TITLE_COUNT + (component.external ? 0 :  properties.configIds.length);

  let propIndex = properties.stateIds.findIndex(value => value === memberName);
  if (propIndex === -1) {
    propIndex = properties.stateIds.length + properties.actionIds.findIndex(value => value === memberName);
  }

  propIndex += headerCount;

  return propIndex;
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

export function posToGrid(userPos: Point): Point {
  return {
    x:  Math.round(userPos.x / GRID_STEP_SIZE),
    y:  Math.round(userPos.y / GRID_STEP_SIZE),
  };
}

export function lockSelectionPosition(selectionRect: Rectangle, position: Point): Point {
  return posToGrid({
    x: lockBetween(position.x * GRID_STEP_SIZE, LAYER_SIZE - selectionRect.width),
    y: lockBetween(position.y * GRID_STEP_SIZE, LAYER_SIZE - selectionRect.height),
  });
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

export function mergeRects(rects: Rectangle[]): Rectangle {
  let left = Infinity;
  let right = 0;
  let top = Infinity;
  let bottom = 0;

  for (const rect of rects) {
    left = Math.min(left, rect.x);
    right = Math.max(right, rect.x + rect.width);
    top = Math.min(top, rect.y);
    bottom = Math.max(bottom, rect.y + rect.height);
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
}

export function computeCenter(rect: Rectangle) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}
