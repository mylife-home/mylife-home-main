import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useSafeSelector } from './drawing/use-safe-selector';
import { computeComponentRect, lockSelectionPosition, mergeRects, posToGrid } from './drawing/shapes';
import { useCanvasTheme } from './drawing/theme';
import { Point, Rectangle } from './drawing/types';
import { useSelection, getSelectedComponentsIds, MultiSelectionIds } from './selection';
import { useTabPanelId } from '../lib/tab-panel';

import { AppState } from '../../store/types';
import { getComponent, getPlugin, getAllComponentsAndPlugins } from '../../store/core-designer/selectors';
import { moveComponents } from '../../store/core-designer/actions';
import * as types from '../../store/core-designer/types';

interface ComponentMoveContextProps {
  componentsIds: MultiSelectionIds;
  delta: types.Position;
  move: (delta: types.Position) => void;
}

export const ComponentMoveContext = createContext<ComponentMoveContextProps>(null);

export const ComponentMoveProvider: FunctionComponent = ({ children }) => {
  const { selection } = useSelection();
  const [componentsIds, setComponentsIds] = useState<MultiSelectionIds>(null);
  const [delta, move] = useState<types.Position>(null);

  useEffect(() => {
    setComponentsIds(getSelectedComponentsIds(selection));
    move(null);
  }, [selection]);

  const contextProps = useMemo(() => ({ componentsIds, delta, move }), [componentsIds, delta, move]);

  return (
    <ComponentMoveContext.Provider value={contextProps}>
      {children}
    </ComponentMoveContext.Provider>
  );
};

export function useMovableComponent(componentId: string) {
  const theme = useCanvasTheme();
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const storeComponent = useSafeSelector(useCallback((state: AppState) => getComponent(state, tabId, componentId), [componentId]));
  const plugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, tabId, storeComponent.plugin), [storeComponent.plugin]));
  const componentsAndPlugins = useSelector(useCallback((state: AppState) => getAllComponentsAndPlugins(state, tabId), [tabId]));
  
  const context = useContext(ComponentMoveContext);

  const component = useMemo(() => {
    const { componentsIds, delta } = context;
    if (!storeComponent || !componentsIds[storeComponent.id] || !delta) {
      return storeComponent;
    }

    return { ...storeComponent, position: addPositions(storeComponent.position, delta) };
  }, [storeComponent, context]);

  const move = useCallback(
    (userPos: types.Position) => {
      if (!context.componentsIds[componentId]) {
        console.error(`Trying to move unselected component '${componentId}', ignored`);
        return;
      }

      let currentComponentRect: Rectangle;

      const rects = Object.keys(context.componentsIds).map(id => {
        const component = componentsAndPlugins.components[id];
        const plugin = componentsAndPlugins.plugins[component.plugin];
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
    [dispatch, tabId, componentId, context, storeComponent?.position, plugin, componentsAndPlugins]
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

      dispatch(moveComponents({ id: tabId, componentsIds: Object.keys(context.componentsIds), delta: context.delta }));
      context.move(null);
    },
    [dispatch, tabId, componentId, context]
  );

  return {
    component, 
    plugin, 
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
