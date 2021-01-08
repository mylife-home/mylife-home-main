import { useRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';

export interface Position {
  x: number;
  y: number;
}

type ItemTypes = 'move' | 'new';

interface DragItem {
  type: ItemTypes;
}

export function useDroppable() {
  const dropRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ['move', 'new'],
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

export function useMoveable(position: Position, onMove: (position: Position) => void) {

  const [{ isDragging }, ref] = useDrag({
    item: { type: 'move' } as DragItem,
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

export function useCreatable(onCreate: (position: Position) => void) {
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'new' } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item: DragItem, monitor) {
      if (monitor.didDrop()) {
        onCreate(monitor.getDropResult());
      }
    }
  });

  return { drag, isDragging };
};
