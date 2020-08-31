import React, { FunctionComponent } from 'react';

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

  switch(selection?.type) {

    case 'component': {
      const selectedComponent = components.find(component => component.id === selection.id); // FIXME: index components by id
      return (
        <Component component={selectedComponent} setSelection={setSelection} />
      );
    }

    case 'binding': {
      const selectedBinding = bindings.find(binding => binding.id === selection.id); // FIXME: index bindings by id
      return (
        <Binding binding={selectedBinding} setSelection={setSelection} />
      );
    }

    default:
      return null;
  }
};

export default SelectionPanel;