import React, { FunctionComponent, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useSelection } from '../selection';
import { Konva, Layer } from '../drawing/konva';
import { BindingDndProvider, BindingSource } from './binding-dnd';
import Canvas, { MetaDragEvent } from './canvas';
import Component from './component';
import Binding from './binding';
import ComponentSelectionMark from './component-selection-mark';
import BindingDndMark from './binding-dnd-mark';
import { Rectangle } from '../drawing/types';
import { CanvasTheme, useCanvasTheme } from '../drawing/theme';
import { computeComponentRect, computeMemberRect } from '../drawing/shapes';
import { createBindingData, isBindingTarget } from '../binding-tools';

import { AppState } from '../../../store/types';
import { getComponentIds, getBindingIds, getAllComponentsAndPlugins } from '../../../store/core-designer/selectors';
import * as types from '../../../store/core-designer/types';
import { setBinding } from '../../../store/core-designer/actions';

const MainView: FunctionComponent = () => {
  const { componentIds, bindingIds } = useConnect();
  const { selectedComponent, selectedComponents } = useSelection();
  const stageRef = useRef<Konva.Stage>(null);
  const onDrop = useNewBinding();

  const onMetaDrag = (e: MetaDragEvent) => {
    console.log(e);
  }

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

          {selectedComponent && (
            <ComponentSelectionMark componentId={selectedComponent} />
          )}

          {selectedComponents && Object.keys(selectedComponents).map(componentId => (
            <ComponentSelectionMark key={componentId} componentId={componentId} />
          ))}
        </Layer>
      </BindingDndProvider>
    </Canvas>
  );
};

export default MainView;

function useConnect() {
  const tabId = useTabPanelId();
  return {
    componentIds: useSelector((state: AppState) => getComponentIds(state, tabId)),
    bindingIds: useSelector((state: AppState) => getBindingIds(state, tabId)),
  };
}

function useNewBinding() {
  const tabId = useTabPanelId();
  const theme = useCanvasTheme();
  const componentsAndPlugins = useSelector((state: AppState) => getAllComponentsAndPlugins(state, tabId));
  const dispatch = useDispatch();

  return useCallback((source: BindingSource, mousePosition: types.Position) => {

    // else render problem ?!?
    setTimeout(() => {
      const target = findBindingTarget(theme, mousePosition, componentsAndPlugins);


      if (!target || !isBindingTarget(source, target)) {
        return;
      }
  
      const binding = createBindingData(source.componentId, source.memberName, source.memberType, target);
      dispatch(setBinding({ id: tabId, binding }));
    }, 0);

  }, [theme, componentsAndPlugins, dispatch, tabId]);
}

// TODO: need model cleanup
function findBindingTarget(theme: CanvasTheme, mousePosition: types.Position, { components, plugins }: { components: { [id: string]: types.Component }, plugins: { [id: string]: types.Plugin } }): BindingSource {
  for (const component of Object.values(components)) {
    const plugin = plugins[component.plugin];

    const componentRect = computeComponentRect(theme, component, plugin);
    if (!isInRect(mousePosition, componentRect)) {
      continue;
    }

    for (const [memberName, member] of Object.entries(plugin.members)) {
      const memberRect = computeMemberRect(theme, component, plugin, memberName);
      if (isInRect(mousePosition, memberRect)) {
        return { componentId: component.id, memberName, memberType: member.memberType, valueType: member.valueType };
      }
    }

    // If we found a component, no need to continue
    break;
  }
}

function isInRect(position: types.Position, rect: Rectangle) {
  return position.x >= rect.x && position.x < rect.x + rect.width && position.y >= rect.y && position.y < rect.y + rect.height;
}