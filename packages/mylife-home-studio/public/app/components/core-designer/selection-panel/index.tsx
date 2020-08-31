import React, { FunctionComponent, useMemo } from 'react';

import Component from './component';
import Binding from './binding';

import { Selection } from '../types';

import * as schema from '../../../files/schema';

interface SelectionPanelProps {
  selection: Selection;
  components: schema.Component[];
  bindings: schema.Binding[];
  setSelection: (selection: Selection) => void;
}

const SelectionPanel: FunctionComponent<SelectionPanelProps> = ({ components, bindings, selection, setSelection }) => {

  const compMap = useMemo(() => {
    const map: {[id: string]: schema.Component; } = {};
    for(const comp of components) {
      map[comp.id] = comp;
    }
    return map;
  }, [components]);
  
  const bindMap = useMemo(() => {
    const map: {[id: string]: schema.Binding; } = {};
    for(const bind of bindings) {
      map[bind.id] = bind;
    }
    return map;
  }, [bindings]);

  switch(selection?.type) {

    case 'component': {
      const selectedComponent = compMap[selection.id];
      return (
        <Component component={selectedComponent} setSelection={setSelection} />
      );
    }

    case 'binding': {
      const selectedBinding = bindMap[selection.id];
      const sourceComponent = compMap[selectedBinding.sourceComponent];
      const targetComponent = compMap[selectedBinding.targetComponent];
      return (
        <Binding
          binding={selectedBinding}
          sourceComponent={sourceComponent}
          targetComponent={targetComponent}
          setSelection={setSelection}
        />
      );
    }

    default:
      return null;
  }
};

export default SelectionPanel;