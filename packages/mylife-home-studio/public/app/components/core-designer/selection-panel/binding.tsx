import React, { FunctionComponent } from 'react';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { Selection } from '../types';

import * as schema from '../../../files/schema';

interface BindingProps {
  binding: schema.Binding;
  setSelection: (selection: Selection) => void;
}

const Binding: FunctionComponent<BindingProps> = ({ binding, setSelection }) => {
  const handleSelectCenter = () => {
    console.log('handleSelectCenter')
  };

  const handleSelectSource = () => {
    setSelection({ type: 'component', index: 0 });
  };

  const handleSelectTarget = () => {
    setSelection({ type: 'component', index: 0 });
  };

  return (
    <div>
      <Button onClick={handleSelectCenter}>Binding</Button>
      <Button onClick={handleSelectSource}>{binding.sourceComponent}</Button>
      <Typography>{binding.sourceState}</Typography>
      <Button onClick={handleSelectTarget}>{binding.targetComponent}</Button>
      <Typography>{binding.targetAction}</Typography>
    </div>
  );
};

export default Binding;