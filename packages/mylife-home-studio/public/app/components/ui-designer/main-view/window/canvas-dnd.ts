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
          return { x: offset.x - containerPosition.x - 10, y: offset.y - containerPosition.y - 10 } as Position;
        }

        case ItemTypes.MOVE: {
          // on move return delta
          return monitor.getDifferenceFromInitialOffset();
        }
      }

      const containerPosition = getContainerPosition(dropRef.current);
      const offset = monitor.getClientOffset();
      return { x: offset.x - containerPosition.x - 10, y: offset.y - containerPosition.y - 10 } as Position;
    }
  });

  drop(dropRef);

  return dropRef;
}

function getContainerPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const { scrollLeft, scrollTop } = element;
  return { x: rect.x - scrollLeft, y: rect.y - scrollTop };
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
