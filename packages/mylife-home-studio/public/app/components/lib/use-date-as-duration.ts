import { useState, useEffect } from 'react';
import humanizeDuration from 'humanize-duration';
import { useInterval } from './use-interval';

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
  format?: humanizeDuration.Options;
}

const DEFAULT_FORMAT = { language: 'fr', largest: 2, round: true };

export function useDateAsFormattedDuration(value: Date, options: FormattedOptions = {}) {
  const duration = useDateAsDuration(value, options);
  const format = { ...DEFAULT_FORMAT, ...options.format };
  return humanizeDuration(duration, format);
}