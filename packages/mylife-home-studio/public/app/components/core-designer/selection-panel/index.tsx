import React, { FunctionComponent, useMemo } from 'react';

import Component from './component';
import Binding from './binding';

import { Selection } from '../types';

interface SelectionPanelProps {
  selection: Selection;
  setSelection: (selection: Selection) => void;
}

const SelectionPanel: FunctionComponent<SelectionPanelProps> = ({ selection, setSelection }) => {

  switch(selection?.type) {

    case 'component':
      return (
        <Component componentId={selection.id} setSelection={setSelection} />
      );

    case 'binding':
      return (
        <Binding bindingId={selection.id} setSelection={setSelection} />
      );

    default:
      return null;
  }
};

export default SelectionPanel;