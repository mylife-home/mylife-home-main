import React, { FunctionComponent, useCallback, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useTabSelector } from '../../lib/use-tab-selector';
import { useSelectComponents } from '../selection';
import { Konva, Layer } from '../drawing/konva';
import { BindingDndProvider, BindingSource } from './binding-dnd';
import Canvas, { MetaDragEvent } from './canvas';
import Component from './component';
import Binding from './binding';
import BindingDndMark from './binding-dnd-mark';
import SelectingMark from './selecting-mark';
import { Rectangle, Point } from '../drawing/types';
import { CanvasTheme, useCanvasTheme } from '../drawing/theme';
import { computeComponentRect, computeMemberRect } from '../drawing/shapes';
import { createBindingData, isBindingTarget } from '../binding-tools';

import { AppState } from '../../../store/types';
import { getComponentIds, getBindingIds, getComponentsMap, getComponentDefinitionPropertiesGetter } from '../../../store/core-designer/selectors';
import * as types from '../../../store/core-designer/types';
import { setBinding } from '../../../store/core-designer/actions';

const MainView: FunctionComponent = () => {
  const { componentIds, bindingIds } = useConnect();
  const stageRef = useRef<Konva.Stage>(null);
  const onDrop = useNewBinding();

  const { selectingRect, onMetaDrag } = useMultiSelecting();

  return (
    <Canvas stageRef={stageRef} onMetaDrag={onMetaDrag}>
      <BindingDndProvider stage={stageRef.current} onDrop={onDrop}>
        <Layer name='bindings'>
          {bindingIds.map(id => (
            <Binding key={id} bindingId={id} />
          ))}

          <BindingDndMark />
        </Layer>

        <Layer name='components'>
          {componentIds.map(id => (
            <Component key={id} componentId={id} />  
          ))}

          {selectingRect && (
            <SelectingMark rect={selectingRect} />
          )}
        </Layer>
      </BindingDndProvider>
    </Canvas>
  );
};

export default MainView;

function useConnect() {
  const tabId = useTabPanelId();
  return {
    componentIds: useSelector(useCallback((state: AppState) => getComponentIds(state, tabId), [tabId])),
    bindingIds: useSelector(useCallback((state: AppState) => getBindingIds(state, tabId), [tabId])),
  };
}

function useNewBinding() {
  const theme = useCanvasTheme();
  const componentsIds = useTabSelector(getComponentIds);
  const componentsMap = useSelector(getComponentsMap);
  const getComponentDefinitionProperties = useSelector(getComponentDefinitionPropertiesGetter);
  const dispatch = useDispatch();

  return useCallback((source: BindingSource, mousePosition: types.Position) => {

    // else render problem ?!?
    // FIXME
    setTimeout(() => {
      const target = findBindingTarget(theme, mousePosition, componentsIds, componentsMap, getComponentDefinitionProperties);
      if (!target || !isBindingTarget(source, target)) {
        return;
      }
  
      const binding = createBindingData(source.componentId, source.memberName, source.memberType, target);
      dispatch(setBinding({ binding }));
    }, 0);

  }, [theme, componentsIds, componentsMap, getComponentDefinitionProperties, dispatch]);
}

function useMultiSelecting() {
  const [start, setStart] = useState<Point>(null);
  const [move, setMove] = useState<Point>(null);
  const selectComponents = useSelectComponents();

  const theme = useCanvasTheme();
  const componentsIds = useTabSelector(getComponentIds);
  const componentsMap = useSelector(getComponentsMap);
  const getComponentDefinitionProperties = useSelector(getComponentDefinitionPropertiesGetter);

  const selectingRect = useMemo(() => {
    if (!start || !move) {
      return null;
    }

    return {
      x: Math.min(start.x, move.x),
      y: Math.min(start.y, move.y),
      width: Math.abs(start.x - move.x),
      height: Math.abs(start.y - move.y),
    };
  }, [start, move]);
  
  const onMetaDrag = useCallback((e: MetaDragEvent) => {
    switch (e.type) {
      case 'start': 
        setStart(e.position);
        setMove(e.position);
        break;
      
      case 'move':
        setMove(e.position);
        break;

      case 'end': {
        setStart(null);
        setMove(null);

        const ids = findComponentsInRect(theme, selectingRect, componentsIds, componentsMap, getComponentDefinitionProperties);
        selectComponents(ids);
        break;
      }
    }
  }, [setStart, setMove, selectingRect, theme, componentsIds, componentsMap, getComponentDefinitionProperties, selectComponents]);

  return { selectingRect, onMetaDrag };
}

// TODO: need model cleanup
function findBindingTarget(theme: CanvasTheme, mousePosition: types.Position, componentsIds: string[], componentsMap: { [id: string]: types.Component }, getComponentDefinitionProperties: (definition: types.ComponentDefinition) => types.ComponentDefinitionProperties): BindingSource {
  for (const componentId of componentsIds) {
    const component = componentsMap[componentId];
    const definition = getComponentDefinitionProperties(component.definition);

    const componentRect = computeComponentRect(theme, component, definition);
    if (!isInRect(mousePosition, componentRect)) {
      continue;
    }

    for (const [memberName, member] of Object.entries(definition.members)) {
      const memberRect = computeMemberRect(theme, component, definition, memberName);
      if (isInRect(mousePosition, memberRect)) {
        return { componentId: component.id, memberName, memberType: member.memberType, valueType: member.valueType };
      }
    }

    // If we found a component, no need to continue
    break;
  }
}

// TODO: need model cleanup
function findComponentsInRect(theme: CanvasTheme, selectingRect: Rectangle, componentsIds: string[], componentsMap: { [id: string]: types.Component }, getComponentDefinitionProperties: (definition: types.ComponentDefinition) => types.ComponentDefinitionProperties) {
  const ids: string[] = [];

  for (const componentId of componentsIds) {
    const component = componentsMap[componentId];
    const definition = getComponentDefinitionProperties(component.definition);
    
    const componentRect = computeComponentRect(theme, component, definition);
    if (isRectInRect(componentRect, selectingRect)) {
      ids.push(component.id);
    }
  }

  return ids;
}

function isInRect(position: types.Position, rect: Rectangle) {
  return position.x >= rect.x && position.x < rect.x + rect.width && position.y >= rect.y && position.y < rect.y + rect.height;
}

function isRectInRect(position: Rectangle, rect: Rectangle) {
  const topLeft = { x: position.x, y: position.y };
  const topRight = { x: position.x + position.width, y: position.y };
  const bottomLeft = { x: position.x, y: position.y + position.height };
  const bottomRight = { x: position.x + position.width, y: position.y + position.height };
  return isInRect(topLeft, rect) || isInRect(topRight, rect) || isInRect(bottomLeft, rect) || isInRect(bottomRight, rect);
}
