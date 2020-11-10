import React, { FunctionComponent, useState, useEffect } from 'react';
import humanizeDurationImpl from 'humanize-duration';
import Tooltip from '@material-ui/core/Tooltip';
import { useInterval } from './use-interval';

export type HumanizeDurationOptions = humanizeDurationImpl.Options;

const DEFAULT_FORMAT: HumanizeDurationOptions = { language: 'fr', largest: 2, round: true };

export function humanizeDuration(ms: number, options?: HumanizeDurationOptions) {
  const format = { ...DEFAULT_FORMAT, ...options };
  return humanizeDurationImpl(ms, format);
}

export interface Options {
  interval?: number;
}

export function useDateAsDuration(value: Date, options: Options = {}) {
  const { interval = 200 } = options;
  const [duration, setDuration] = useState(0);

  const computeDuration = () => {
    setDuration(new Date().valueOf() - value.valueOf());
  };

  useInterval(computeDuration, interval);
  useEffect(computeDuration, [value]);

  return duration;
};

export interface FormattedOptions extends Options {
  format?: HumanizeDurationOptions;
}


export function useDateAsFormattedDuration(value: Date, options: FormattedOptions = {}) {
  const duration = useDateAsDuration(value, options);
  return humanizeDuration(duration, options.format);
}

export const Duration: FunctionComponent<{ value: Date }> = ({ value }) => {
  const duration = useDateAsFormattedDuration(value);

  return (
    <Tooltip title={value.toLocaleString('fr-FR')}>
      <div>
        {duration}
      </div>
    </Tooltip>
  );
};
