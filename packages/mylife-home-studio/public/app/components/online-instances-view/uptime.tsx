import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import humanizeDuration from 'humanize-duration';
import Tooltip from '@material-ui/core/Tooltip';
import { useInterval } from '../lib/use-interval';

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
  const [duration, setDuration] = useState(0);

  const computeDuration = () => {
    setDuration(new Date().valueOf() - value.valueOf());
  };

  useInterval(computeDuration, 200);
  useEffect(computeDuration, [value]);

  return (
    <Tooltip title={value.toLocaleString('fr-FR')}>
      <div>
        {humanizeDuration(duration, { language: 'fr', largest: 2, round: true })}
      </div>
    </Tooltip>
  );
};
