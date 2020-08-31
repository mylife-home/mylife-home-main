import React, { FunctionComponent } from 'react';

import Typography from '@material-ui/core/Typography';

import { Selection } from '../types';

import * as schema from '../../../files/schema';

interface ComponentProps {
  component: schema.Component;
  setSelection: (selection: Selection) => void;
}

const Component: FunctionComponent<ComponentProps> = ({ component, setSelection }) => {
  return (
    <Typography>Selection {component.id}</Typography>
  );
};

export default Component;