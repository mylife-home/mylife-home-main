import React, { FunctionComponent } from 'react';

import Typography from '@material-ui/core/Typography';

import { Selection } from '../types';

import * as schema from '../../../files/schema';

interface BindingProps {
  binding: schema.Binding;
  setSelection: (selection: Selection) => void;
}

const Binding: FunctionComponent<BindingProps> = ({ binding, setSelection }) => {
  return (
    <Typography>Selection {binding.sourceComponent} - {binding.targetComponent}</Typography>
  );
};

export default Binding;