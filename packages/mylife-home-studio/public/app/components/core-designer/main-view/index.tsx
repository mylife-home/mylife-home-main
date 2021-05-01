import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useSelection } from '../selection';
import { Layer } from '../drawing/konva';
import { BindingDndProvider } from './binding-dnd';
import Canvas from './canvas';
import Component from './component';
import Binding from './binding';
import ComponentSelectionMark from './component-selection-mark';
import BindingDndMark from './binding-dnd-mark';

import { AppState } from '../../../store/types';
import { getComponentIds, getBindingIds } from '../../../store/core-designer/selectors';

const MainView: FunctionComponent = () => {
  const { componentIds, bindingIds } = useConnect();
  const { selection } = useSelection();

  return (
    <Canvas>
      <BindingDndProvider onDrop={(source, mousePosition) => console.log(source, mousePosition)}>
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

          {selection && selection.type === 'component' && (
            <ComponentSelectionMark componentId={selection.id} />
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
    componentIds: useSelector((state: AppState) => getComponentIds(state, tabId)),
    bindingIds: useSelector((state: AppState) => getBindingIds(state, tabId)),
  };
}
