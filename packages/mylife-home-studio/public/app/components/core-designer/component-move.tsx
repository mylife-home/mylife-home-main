import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useSafeSelector } from './drawing/use-safe-selector';
import { computeComponentRect, lockSelectionPosition, mergeRects } from './drawing/shapes';
import { useCanvasTheme } from './drawing/theme';
import { useSelection, getSelectedComponentsIds, MultiSelectionIds } from './selection';
import { useTabPanelId } from '../lib/tab-panel';

import { AppState } from '../../store/types';
import { getComponent, getPlugin, getAllComponentsAndPlugins } from '../../store/core-designer/selectors';
import { moveComponent } from '../../store/core-designer/actions';
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
  const storeComponent = useSafeSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSafeSelector((state: AppState) => getPlugin(state, tabId, storeComponent.plugin));
  const componentsAndPlugins = useSelector((state: AppState) => getAllComponentsAndPlugins(state, tabId));
  
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

      const rects = Object.keys(context.componentsIds).map(id => {
        const component = componentsAndPlugins.components[id];
        const plugin = componentsAndPlugins.plugins[component.plugin];
        return computeComponentRect(theme, component, plugin);
      });

      const rect = mergeRects(rects);
      const position = lockSelectionPosition(rect, userPos);

      const delta = subPositions(position, storeComponent.position);
      context.move(delta);
    },
    [dispatch, tabId, componentId, context, storeComponent.position, plugin]
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

      // TODO 
      console.log('moveComponents', Object.keys(context.componentsIds), context.delta);
      // dispatch(moveComponent({ id: tabId, componentId, position: context.position }));
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
