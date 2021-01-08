import { useRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';

export interface Position {
  x: number;
  y: number;
}

const itemType = Symbol('dnd-canvas-move');

interface DragItem {
  type: symbol;
}

export function useDroppable() {
  const dropRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: itemType,
    drop(item: DragItem, monitor) {
      const containerPosition = getContainerPosition(dropRef.current);
      const offset = monitor.getSourceClientOffset();
      return { x: offset.x - containerPosition.x, y: offset.y - containerPosition.y } as Position;
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

export function useMoveable(onMove: (position: Position) => void) {
  const [{ isDragging }, ref] = useDrag({
    item: { type: itemType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item: DragItem, monitor) {
      if (monitor.didDrop()) {
        onMove(monitor.getDropResult());
      }
    }
  });

  return { ref, isMoving: isDragging };
}
