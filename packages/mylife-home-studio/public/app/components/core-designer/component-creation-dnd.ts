import { useCallback } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { useSelector } from 'react-redux';

import { Konva } from './drawing/konva';
import { useCursorPositionConverter } from './drawing/viewport-manips';
import { useCanvasTheme } from './drawing/theme';
import { Point } from './drawing/types';
import { AppState } from '../../store/types';
import { getPlugin } from '../../store/core-designer/selectors';
import { Component, Position } from '../../store/core-designer/types';
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

export function useCreatable(pluginId: string, onCreate: (position: Position) => void) {
  const newComponentPosition = useNewComponentPosition(pluginId);

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

function useNewComponentPosition(pluginId: string) {
  const theme = useCanvasTheme();
  const plugin = useSelector(useCallback((state: AppState) => getPlugin(state, pluginId), [pluginId]));

  return useCallback((userPos: Point) => {
    // Create fake component to get its rect
    const fakeComponent: Component = {
      id: null,
      componentId: null,
      external: false,
      bindings: null,
      config: {}, 
      position: { x: 0, y: 0 },
      plugin: plugin.id
    };

    // needed to compute rect
    for (const id of plugin.configIds) {
      fakeComponent.config[id] = null;
    }

    const position = posToGrid(userPos);
    const rect = computeComponentRect(theme, fakeComponent, plugin);
    const lockedPos = lockSelectionPosition(rect, position);

    return lockedPos;
  }, [theme, plugin]);
}