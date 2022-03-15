import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useSafeSelector } from './drawing/use-safe-selector';
import { computeComponentRect, lockSelectionPosition, mergeRects, posToGrid } from './drawing/shapes';
import { useCanvasTheme } from './drawing/theme';
import { Rectangle } from './drawing/types';
import { useTabPanelId } from '../lib/tab-panel';
import { useTabSelector } from '../lib/use-tab-selector';

import { AppState } from '../../store/types';
import { getComponent, getPlugin, getAllComponents, getAllPlugins, getSelectedComponents } from '../../store/core-designer/selectors';
import { moveComponents } from '../../store/core-designer/actions';
import * as types from '../../store/core-designer/types';

interface ComponentMoveContextProps {
  componentsIds: types.MultiSelectionIds;
  delta: types.Position;
  move: (delta: types.Position) => void;
}

export const ComponentMoveContext = createContext<ComponentMoveContextProps>(null);

export const ComponentMoveProvider: FunctionComponent = ({ children }) => {
  const componentsIds = useTabSelector(getSelectedComponents);
  const [delta, setDelta] = useState<types.Position>(null);

  const move = useCallback((point: types.Position) => {
    setDelta(prev => {
      if (!prev || !point) {
        return point;
      }

      if (prev.x === point.x && prev.y === point.y) {
        // Do not change the point if it's equal to the previous (it avoids memo to be re-computed).
        return prev;
      } else {
        return point;
      }
    });
  }, [setDelta]);

  useEffect(() => {
    move(null);
  }, [componentsIds]);

  const contextProps = useMemo(() => ({ componentsIds, delta, move }), [componentsIds, delta, move]);

  return (
    <ComponentMoveContext.Provider value={contextProps}>
      {children}
    </ComponentMoveContext.Provider>
  );
};

export function useComponentData(componentId: string) {
  const tabId = useTabPanelId();
  const storeComponent = useSafeSelector(useCallback((state: AppState) => getComponent(state, tabId, componentId), [componentId]));
  const plugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, tabId, storeComponent.plugin), [storeComponent.plugin]));

  const context = useContext(ComponentMoveContext);

  const position = useMemo(() => {
    const { componentsIds, delta } = context;
    if (!storeComponent || !componentsIds[storeComponent.id] || !delta) {
      return storeComponent.position;
    }

    return addPositions(storeComponent.position, delta);
  }, [storeComponent, context.delta, context.componentsIds]);

  const component = useMemo(() => (position ? { ...storeComponent, position } : storeComponent), [storeComponent, position]);

  return {
    position,
    component,
    plugin, 
  };
}

export function useMovableComponent(componentId: string) {
  const theme = useCanvasTheme();
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const storeComponent = useSafeSelector(useCallback((state: AppState) => getComponent(state, tabId, componentId), [componentId]));
  const plugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, tabId, storeComponent.plugin), [storeComponent.plugin]));
  const allComponents = useSelector(useCallback((state: AppState) => getAllComponents(state, tabId), [tabId]));
  const allPlugins = useSelector(useCallback((state: AppState) => getAllPlugins(state, tabId), [tabId]));
  
  const context = useContext(ComponentMoveContext);

  const move = useCallback(
    (userPos: types.Position) => {
      if (!context.componentsIds[componentId]) {
        console.error(`Trying to move unselected component '${componentId}', ignored`);
        return;
      }

      let currentComponentRect: Rectangle;

      const rects = Object.keys(context.componentsIds).map(id => {
        const component = allComponents[id];
        const plugin = allPlugins[component.plugin];
        const rect = computeComponentRect(theme, component, plugin);

        if (id === componentId) {
          currentComponentRect = rect;
        }

        return rect;
      });

      const rect = mergeRects(rects);
      // compute offset between component position and selection position
      const offset = subPositions(posToGrid(currentComponentRect), posToGrid(rect));

      const selectionPos = subPositions(userPos, offset);
      const lockedSelectionPosition = lockSelectionPosition(rect, selectionPos);
      const componentPosition = addPositions(lockedSelectionPosition, offset);

      const delta = subPositions(componentPosition, storeComponent.position);
      context.move(delta);
    },
    [dispatch, tabId, componentId, context, storeComponent?.position, plugin, allComponents, allPlugins]
  );

  const moveEnd = useCallback(
    () => {
      if (!context.componentsIds[componentId]) {
        console.error(`Trying to moveEnd unselected component '${componentId}', ignored`);
        return;
      }

      if (!context.delta) {
        console.error(`Trying to moveEnd component '${componentId}' with no delta defined, ignored`);
        return;
      }

      if (context.delta.x || context.delta.y) {
        // No need to dispatch if not moved at the end.
        dispatch(moveComponents({ id: tabId, componentsIds: Object.keys(context.componentsIds), delta: context.delta }));
      }

      context.move(null);
    },
    [dispatch, tabId, componentId, context]
  );

  return {
    move,
    moveEnd,
  };
}

function addPositions(p1: types.Position, p2: types.Position): types.Position {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
}

function subPositions(p1: types.Position, p2: types.Position): types.Position {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}
