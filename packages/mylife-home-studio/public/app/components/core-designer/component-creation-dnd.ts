import { useCallback, useMemo } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { useSelector } from 'react-redux';

import { Konva } from './drawing/konva';
import { useCursorPositionConverter } from './drawing/viewport-manips';
import { useCanvasTheme } from './drawing/theme';
import { Point } from './drawing/types';
import { AppState } from '../../store/types';
import { getPlugin, makeGetComponentDefinitionProperties } from '../../store/core-designer/selectors';
import { Component, ComponentDefinition, Position } from '../../store/core-designer/types';
import { computeComponentRect, lockSelectionPosition, posToGrid } from './drawing/shapes';

const ItemType = Symbol('dnd-canvas-create');

interface DragItem {
  type: typeof ItemType;
}

export function useDroppable(stage: Konva.Stage) {
  const convertCursorPosition = useCursorPositionConverter(stage);
  const [, ref] = useDrop({
    accept: ItemType,
    drop: (item, monitor) => {
      return convertCursorPosition(monitor.getClientOffset());
    },
  });

  return ref;
}

export function useCreatable(definition: ComponentDefinition, onCreate: (position: Position) => void) {
  const newComponentPosition = useNewComponentPosition(definition);

  const [, ref, preview] = useDrag({
    item: { type: ItemType },
    end(item: DragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      const point: Point = monitor.getDropResult();
      const newPosition = newComponentPosition(point);
      onCreate(newPosition);
    }
  });

  // TODO: improve preview

  return { ref };
}

function useNewComponentPosition(definition: ComponentDefinition) {
  const theme = useCanvasTheme();
  const getComponentDefinitionProperties = useMemo(() => makeGetComponentDefinitionProperties(), []);
  const properties = useSelector(useCallback((state: AppState) => getComponentDefinitionProperties(state, definition), [definition]));

  return useCallback((userPos: Point) => {
    // Create fake component to get its rect
    const fakeComponent: Component = {
      id: null,
      componentId: null,
      external: false,
      bindings: null,
      config: {}, 
      position: { x: 0, y: 0 },
      definition
    };

    const position = posToGrid(userPos);
    const rect = computeComponentRect(theme, fakeComponent, properties);
    const lockedPos = lockSelectionPosition(rect, position);

    return lockedPos;
  }, [theme, properties]);
}