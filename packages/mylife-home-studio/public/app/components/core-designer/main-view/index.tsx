import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { Layer } from '../drawing/konva';
import { Point } from '../drawing/types';
import { Selection } from '../types';
import Canvas from './canvas';
import Component from './component';
import Binding from './binding';
import ComponentSelectionMark from './component-selection-mark';

import { AppState } from '../../../store/types';
import { getComponentIds, getBindingIds } from '../../../store/core-designer/selectors';

export interface MainViewProps {
  selection: Selection;
  setSelection: (selection: Selection) => void;
}

const MainView: FunctionComponent<MainViewProps> = ({ selection, setSelection }) => {
  const { componentIds, bindingIds } = useConnect();

  return (
    <Canvas>
      <Layer name='bindings'>
        {bindingIds.map(id => (
          <Binding key={id} bindingId={id} selected={selection?.type === 'binding' && selection.id === id} onSelect={() => setSelection({ type: 'binding', id })} />
        ))}
      </Layer>

      <Layer name='components'>
        {componentIds.map(id => (
          <Component key={id} componentId={id} onSelect={() => setSelection({ type: 'component', id })} />  
        ))}

        {selection && selection.type === 'component' && <ComponentSelectionMark componentId={selection.id} />}
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
