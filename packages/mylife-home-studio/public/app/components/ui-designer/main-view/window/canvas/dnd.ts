import React, { useEffect, useRef } from 'react';
import { useDrop, useDrag, useDragLayer, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Position, ResizeDirection } from './types';

export const ItemTypes = {
  CREATE: Symbol('dnd-canvas-create'),
  MOVE: Symbol('dnd-canvas-move'),
  RESIZE: Symbol('dnd-canvas-resize'),
};

export interface DragItem {
  type: symbol;
}

export interface CreateDragItem extends DragItem {
  type: typeof ItemTypes.CREATE;
  // no additional data
}

export interface MoveDragItem extends DragItem {
  type: typeof ItemTypes.MOVE;
  id: string; // control id being moved
}

export interface ResizeDragItem extends DragItem {
  type: typeof ItemTypes.RESIZE;
  id: string; // control id being resized, or null for window
  direction: ResizeDirection;
}

interface CreateDropResult {
  position: Position;
}

interface MoveDropResult {
  delta: Position;
}

interface ResizeDropResult {
  delta: Position;
}

export function useDroppable() {
  const dropRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: [ItemTypes.CREATE, ItemTypes.MOVE, ItemTypes.RESIZE],
    drop(item: DragItem, monitor) {

      switch (item.type) {
        case ItemTypes.CREATE: {
          // on create return cursor position
          const containerPosition = getContainerPosition(dropRef.current);
          const offset = monitor.getClientOffset();
          const position = {
            x: Math.round(offset.x - containerPosition.x),
            y: Math.round(offset.y - containerPosition.y)
          };

          const result: CreateDropResult = { position };
          return result;
        }

        case ItemTypes.MOVE: {
          const delta = monitor.getDifferenceFromInitialOffset();
          const result: MoveDropResult = { delta };
          return result;
        }

        case ItemTypes.RESIZE: {
          const delta = monitor.getDifferenceFromInitialOffset();
          const result: ResizeDropResult = { delta };
          return result;
        }
      }
    }
  });

  drop(dropRef);

  return dropRef;
}

const CONTAINER_MARGIN = 10;

function getContainerPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const { scrollLeft, scrollTop } = element;
  return { x: rect.x - scrollLeft + CONTAINER_MARGIN, y: rect.y - scrollTop + CONTAINER_MARGIN };
}

export function useCreatable(onCreate: (position: Position) => void) {
  const [, ref, preview] = useDrag({
    item: { type: ItemTypes.CREATE },
    end(item: CreateDragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      const result = monitor.getDropResult() as CreateDropResult;
      onCreate(result.position);
    }
  });

  useHidePreview(preview);

  return ref;
}

export function useMoveable(id: string, position: Position, onMove: (newPosition: Position) => void) {
  const [{ isDragging }, ref, preview] = useDrag({
    item: { type: ItemTypes.MOVE, id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item: MoveDragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      const result = monitor.getDropResult() as MoveDropResult;
      onMove({ x: position.x + result.delta.x, y: position.y + result.delta.y });
    }
  });

  useHidePreview(preview);

  return { ref, isMoving: isDragging };
}

export function useResizable(id: string, direction: ResizeDirection, onResize: (delta: Position) => void) {
  const [{ isDragging }, resizerRef, preview] = useDrag({
    item: { type: ItemTypes.RESIZE, id, direction },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item: ResizeDragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      const result = monitor.getDropResult() as ResizeDropResult;
      onResize(result.delta);
    }
  });

  useHidePreview(preview);

  return { resizerRef, isResizing: isDragging };
}

const SUPPORTED_DRAG_TYPES = new Set([ItemTypes.CREATE, ItemTypes.MOVE, ItemTypes.RESIZE]);

export function useCanvasDragLayer() {
  return useDragLayer((monitor) => ({
    item: monitor.getItem() as DragItem,
    delta: monitor.getDifferenceFromInitialOffset() as Position,
    currentOffset: monitor.getSourceClientOffset() as Position,
    isDragging: monitor.isDragging() && SUPPORTED_DRAG_TYPES.has(monitor.getItemType() as symbol),
  }));
}

function useHidePreview(preview: ConnectDragPreview) {
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);
}
