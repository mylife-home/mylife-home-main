import React, { FunctionComponent } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { Duration } from '../lib/durations';

const Uptime: FunctionComponent<{ value: Date }> = ({ value }) => {
  if (!value) {
    return null;
  }

  return (
    <Duration value={value} />
  );
};

export default Uptime;
