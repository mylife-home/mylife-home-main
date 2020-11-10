import React, { FunctionComponent } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { useDateAsFormattedDuration } from '../lib/durations';

const Uptime: FunctionComponent<{ value: Date }> = ({ value }) => {
  if (!value) {
    return null;
  }

  return (
    <Duration value={value} />
  );
};

export default Uptime;

const Duration: FunctionComponent<{ value: Date }> = ({ value }) => {
  const duration = useDateAsFormattedDuration(value);

  return (
    <Tooltip title={value.toLocaleString('fr-FR')}>
      <div>
        {duration}
      </div>
    </Tooltip>
  );
};
