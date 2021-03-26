import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useSafeSelector } from './drawing/use-safe-selector';
import { useSelection } from './selection';
import { useTabPanelId } from '../lib/tab-panel';

import { AppState } from '../../store/types';
import { getComponent, getPlugin } from '../../store/core-designer/selectors';
import { moveComponent } from '../../store/core-designer/actions';
import * as types from '../../store/core-designer/types';

interface ComponentMoveContextProps {
  componentId: string;
  position: types.Position;
  move: (position: types.Position) => void;
}

export const ComponentMoveContext = createContext<ComponentMoveContextProps>(null);

export const ComponentMoveProvider: FunctionComponent = ({ children }) => {
  const { selection } = useSelection();
  const [componentId, setComponentId] = useState<string>(null);
  const [position, move] = useState<types.Position>(null);

  useEffect(() => {
    const selectedComponentId = selection && selection.type === 'component' ? selection.id : null;
    setComponentId(selectedComponentId);
    move(null);
  }, [selection]);

  const contextProps = useMemo(() => ({ componentId, position, move }), [componentId, position, move]);

  return (
    <ComponentMoveContext.Provider value={contextProps}>
      {children}
    </ComponentMoveContext.Provider>
  );
};

export function useMovableComponent(componentId: string) {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const storeComponent = useSafeSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSafeSelector((state: AppState) => getPlugin(state, tabId, storeComponent.plugin));
  
  const context = useContext(ComponentMoveContext);

  const component = useMemo(() => {
    const { componentId, position } = context;
    if (componentId !== storeComponent.id || !position) {
      return storeComponent;
    }

    return { ...storeComponent, position };
  }, [storeComponent, context]);

  const move = useCallback(
    (position: types.Position) => {
      if (componentId !== context.componentId) {
        console.error(`Trying to moveEnd unselected component '${componentId}', ignored`);
        return;
      }

      context.move(position);
    },
    [dispatch, tabId, componentId, context]
  );

  const moveEnd = useCallback(
    () => {
      if (componentId !== context.componentId) {
        console.error(`Trying to moveEnd unselected component '${componentId}', ignored`);
        return;
      }

      dispatch(moveComponent({ id: tabId, componentId, position: context.position }));
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