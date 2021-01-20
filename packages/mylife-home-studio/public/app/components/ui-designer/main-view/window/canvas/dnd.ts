import { useEffect, useRef } from 'react';
import { useDrop, useDrag, useDragLayer, XYCoord } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

export interface Position {
  x: number;
  y: number;
}

export type ResizeDirection = 'right' | 'bottom' | 'bottomRight';

const ItemTypes = {
  CREATE: Symbol('dnd-canvas-create'),
  MOVE: Symbol('dnd-canvas-move'),
  RESIZE: Symbol('dnd-canvas-resize'),
};

interface DragItem {
  type: symbol;
}

interface CreateDragItem extends DragItem {
  type: typeof ItemTypes.CREATE;
  // no additional data
}

interface MoveDragItem extends DragItem {
  type: typeof ItemTypes.MOVE;
  id: string; // control id being moved
}

interface ResizeDragItem extends DragItem {
  type: typeof ItemTypes.RESIZE;
  id: string; // control id being resized, or null for window
  direction: ResizeDirection;
}

interface CreateDropResult {
  position: Position;
}

interface MoveDropResult {
  delta: XYCoord;
}

interface ResizeDropResult {
  delta: XYCoord;
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
  const [, ref] = useDrag({
    item: { type: ItemTypes.CREATE },
    end(item: CreateDragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      onCreate(monitor.getDropResult());
    }
  });

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

  useEffect(() => {
    preview(getEmptyImage());
  }, [preview]);

  return { ref, isMoving: isDragging };
}

export function useResizable(id: string, direction: ResizeDirection, onResize: (delta: Position) => void) {
  const [{ delta }, ref] = useDrag({
    item: { type: ItemTypes.RESIZE, id, direction },
    collect: (monitor) => ({
      delta: monitor.isDragging ? monitor.getDifferenceFromInitialOffset() : null,
    }),
    end(item: ResizeDragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      const result = monitor.getDropResult() as ResizeDropResult;
      onResize(result.delta);
    }
  });

  return { ref, delta };
}

const SUPPORTED_DRAG_TYPES = new Set([ItemTypes.CREATE, ItemTypes.MOVE, ItemTypes.RESIZE]);

export function useCanvasDragLayer() {
  return useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging() && SUPPORTED_DRAG_TYPES.has(monitor.getItemType() as symbol),
  }));
}