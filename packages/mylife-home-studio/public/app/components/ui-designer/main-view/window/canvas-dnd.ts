import { useRef } from 'react';
import { useDrop, useDrag, XYCoord } from 'react-dnd';

export interface Position {
  x: number;
  y: number;
}

const ItemTypes = {
  CREATE: Symbol('dnd-canvas-create'),
  MOVE: Symbol('dnd-canvas-move'),
}

interface DragItem {
  type: symbol;
}

export function useDroppable() {
  const dropRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: [ItemTypes.CREATE, ItemTypes.MOVE],
    drop(item: DragItem, monitor) {

      switch(item.type) {
        case ItemTypes.CREATE: {
          // on create return cursor position
          const containerPosition = getContainerPosition(dropRef.current);
          const offset = monitor.getClientOffset();
          return { x: offset.x - containerPosition.x, y: offset.y - containerPosition.y } as Position;
        }

        case ItemTypes.MOVE: {
          // on move return delta
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
    item: { type: ItemTypes.MOVE },
    collect: (monitor) => ({
      delta: monitor.getDifferenceFromInitialOffset(),
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