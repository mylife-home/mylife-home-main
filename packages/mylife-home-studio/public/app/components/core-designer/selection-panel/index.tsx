import React, { FunctionComponent } from 'react';

import Component from './component';
import Binding from './binding';

import { useSelection } from '../selection';

const SelectionPanel: FunctionComponent = () => {
  const { selection } = useSelection();

  switch(selection?.type) {

    case 'component':
      return (
        <Component />
      );

    case 'binding':
      return (
        <Binding />
      );

    default:
      return null;
  }
};

export default SelectionPanel;