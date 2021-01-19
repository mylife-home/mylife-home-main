import { useRef } from 'react';
import { useDrop, useDrag, useDragLayer, XYCoord } from 'react-dnd';

export interface Position {
  x: number;
  y: number;
}

const ItemTypes = {
  CREATE: Symbol('dnd-canvas-create'),
  MOVE: Symbol('dnd-canvas-move'),
  RESIZE: Symbol('dnd-canvas-resize'),
};

interface DragItem {
  type: symbol;
}

interface CreateDragItem extends DragItem {
  // no additional data
}

interface MoveDragItem extends DragItem {
  id: string; // control id being moved
}

interface ResizeDragItem extends DragItem {
  id: string; // control id being resized, or null for window
  direction: 'right' | 'bottom' | 'bottomRight';
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
          return {
            x: Math.round(offset.x - containerPosition.x),
            y: Math.round(offset.y - containerPosition.y)
          } as Position;
        }

        case ItemTypes.MOVE:
        case ItemTypes.RESIZE: {
          // on move/resize return delta
          return monitor.getDifferenceFromInitialOffset();
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

export function useMoveable(position: Position, onMove: (newPosition: Position) => void) {
  const [{ isDragging }, ref] = useDrag({
    item: { type: ItemTypes.MOVE },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item: DragItem, monitor) {
      if (monitor.didDrop()) {
        const delta = monitor.getDropResult() as XYCoord;
        onMove({ x: position.x + delta.x, y: position.y + delta.y });
      }
    }
  });

  return { ref, isMoving: isDragging };
}

export function useCreatable(onCreate: (position: Position) => void) {
  const [, ref] = useDrag({
    item: { type: ItemTypes.CREATE },
    end(item: DragItem, monitor) {
      if (monitor.didDrop()) {
        onCreate(monitor.getDropResult());
      }
    }
  });

  return ref;
}

export function useResizable(onResize: (delta: Position) => void) {
  const [{ delta }, ref] = useDrag({
    item: { type: ItemTypes.RESIZE },
    collect: (monitor) => ({
      delta: monitor.isDragging ? monitor.getDifferenceFromInitialOffset() : null,
    }),
    end(item: DragItem, monitor) {
      if (monitor.didDrop()) {
        const delta = monitor.getDropResult() as XYCoord;
        onResize(delta);
      }
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