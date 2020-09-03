import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import StoreHierarchyFix from '../../lib/store-hierarchy-fix';
import { useTabPanelId } from '../../lib/tab-panel';
import { useSelection } from '../selection';
import { Layer } from '../drawing/konva';
import Canvas from './canvas';
import Component from './component';
import Binding from './binding';
import ComponentSelectionMark from './component-selection-mark';

import { AppState } from '../../../store/types';
import { getComponentIds, getBindingIds } from '../../../store/core-designer/selectors';

const MainView: FunctionComponent = () => {
  const { componentIds, bindingIds } = useConnect();
  const { selection } = useSelection();

  return (
    <Canvas>
      <Layer name='bindings'>
        {bindingIds.map(id => (
          <StoreHierarchyFix key={id}>
            <Binding bindingId={id} />
          </StoreHierarchyFix>
        ))}
      </Layer>

      <Layer name='components'>
        {componentIds.map(id => (
          <StoreHierarchyFix key={id}>
            <Component componentId={id} />  
          </StoreHierarchyFix>
        ))}

        {selection && selection.type === 'component' && (
          <StoreHierarchyFix>
            <ComponentSelectionMark componentId={selection.id} />
          </StoreHierarchyFix>
        )}
      </Layer>
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
