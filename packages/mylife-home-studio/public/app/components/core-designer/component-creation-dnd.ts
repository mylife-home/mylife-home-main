import { useDrop, useDrag } from 'react-dnd';

import { Konva } from './drawing/konva';
import { Position } from '../../store/core-designer/types';

const ItemType = Symbol('dnd-canvas-create');

interface DragItem {
  type: typeof ItemType;
}

export function useDroppable(stage: Konva.Stage) {
  const [, ref] = useDrop({
    accept: ItemType,
    drop: () => {
      const cursorPosition = stage.getPointerPosition();
      // TODO: move/scale
      const position = cursorPosition as Position;
      return position;
    },
  });

  return ref;
}

export function useCreatable(onCreate: (position: Position) => void) {
  const [, ref, preview] = useDrag({
    item: { type: ItemType },
    end(item: DragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      const position = monitor.getDropResult() as Position;
      onCreate(position);
    }
  });

  // TODO: improve preview

  return { ref };
}
