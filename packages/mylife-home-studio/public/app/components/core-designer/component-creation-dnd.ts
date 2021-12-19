import { useCallback } from 'react';
import { useDrop, useDrag } from 'react-dnd';

import { useTabSelector } from '../lib/use-tab-selector';
import { Konva } from './drawing/konva';
import { useCursorPositionConverter } from './drawing/viewport-manips';
import { useCanvasTheme } from './drawing/theme';
import { Point } from './drawing/types';
import { GRID_STEP_SIZE } from './drawing/defs';
import { getPlugin } from '../../store/core-designer/selectors';
import { Component, Position } from '../../store/core-designer/types';
import { computeComponentRect, lockSelectionPosition } from './drawing/shapes';

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
  const plugin = useTabSelector((state, tabId) => getPlugin(state, tabId, pluginId));

  return useCallback((point: Point) => {
    // Create fake component to get its rect
    const fakeComponent: Component = {
      id: null,
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

    const rect = computeComponentRect(theme, fakeComponent, plugin);
    const lockedPoint = lockSelectionPosition(rect, point);
    
    const position: Position = {
      x: Math.round(lockedPoint.x / GRID_STEP_SIZE),
      y: Math.round(lockedPoint.y / GRID_STEP_SIZE),
    };

    return position;
  }, [theme, plugin]);
}