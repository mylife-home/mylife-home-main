import { useEffect, useState, useRef, useCallback } from 'react';

const WAIT_INTERVAL = 300;

class Debounce<T> {
  private timer: NodeJS.Timeout;

  constructor(private callback: (arg: T) => void, private waitInterval: number) {
    this.timer = null;
  }

  call(arg: T) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.doCall(arg), this.waitInterval);
  }

  forceCall(arg: T) {
    this.doCall(arg);
  }

  private doCall(arg: T) {
    this.reset();
    this.callback(arg);
  }

  reset() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  resetCallback(callback: (arg: T) => void) {
    this.callback = callback;
    this.reset();
  }

  resetWaitInterval(waitInterval: number) {
    this.waitInterval = waitInterval;
    this.reset();
  }
}

export function useDebounced<T>(value: T, onChange: (arg: T) => void, waitInterval = WAIT_INTERVAL) {

  const debounceRef = useRef(new Debounce<T>(onChange, waitInterval));
  useEffect(() => debounceRef.current.resetCallback(onChange), [onChange]);
  useEffect(() => debounceRef.current.resetWaitInterval(waitInterval), [waitInterval]);

  const [stateValue, setStateValue] = useState(value);
  useEffect(() => {
    setStateValue(value);
    debounceRef.current.reset();
  }, [value]);

  const componentChange = useCallback((updaterOrValue: React.SetStateAction<T>) => {
    setStateValue(value => {
      const newValue = updaterOrValue instanceof Function ? updaterOrValue(value) : updaterOrValue;
      debounceRef.current.call(newValue);
      return newValue;
    });
  }, [setStateValue, debounceRef.current]);

  const flush = useCallback(() => {
    debounceRef.current.forceCall(stateValue);
  }, [stateValue, debounceRef.current]);

  return { componentValue: stateValue, componentChange, flush };
}
