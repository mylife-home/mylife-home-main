import React, { FunctionComponent } from 'react';

import Component from './component';
import Binding from './binding';

import { useSelection } from '../selection';

const SelectionPanel: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { selection } = useSelection();

  switch(selection?.type) {

    case 'component':
      return (
        <Component className={className} />
      );

    case 'binding':
      return (
        <Binding className={className} />
      );

    default:
      return null;
  }
};

export default SelectionPanel;