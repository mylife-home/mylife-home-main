export const DndItemTypes = {
  COMPONENT: Symbol('dnd-component'),
}

export interface Position {
  x: number;
  y: number;
}

export function computeComponentPosition(pos: Position, delta: Position, gridSize: number): Position {
  return {
    x: computePosValue(pos.x, delta.x, gridSize),
    y: computePosValue(pos.y, delta.y, gridSize)
  };
}

function computePosValue(value: number, delta: number, gridSize: number) {
  const pxValue = value * gridSize + delta;
  return Math.round(pxValue / gridSize);
}

export interface ComponentDragItem {
  id: string;
  type: string;
  x: number;
  y: number;
}