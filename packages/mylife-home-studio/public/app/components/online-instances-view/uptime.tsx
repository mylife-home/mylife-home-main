import React, { FunctionComponent } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { humanizeDuration } from '../lib/durations';

const Uptime: FunctionComponent<{ value: number }> = ({ value }) => {
  if (!value) {
    return null;
  }

  // convert from seconds to milliseconds + round to minute, because refresh is every 60 secs
  const duration = Math.round(value / 60) * 60 * 1000;
  const date = new Date(new Date().valueOf() - duration);

  return (
    <Tooltip title={date.toLocaleString('fr-FR')}>
      <div>
      {humanizeDuration(duration)}
      </div>
    </Tooltip>
  );
};

export default Uptime;
