import { useEffect, useState, useRef, useCallback } from 'react';

const WAIT_INTERVAL = 300;

class Debounce<T> {
  private timer: NodeJS.Timeout;

  constructor(private readonly callback: (arg: T) => void, private readonly waitInterval: number) {
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
}

export function useDebounced<T>(value: T, onChange: (arg: T) => void, waitInterval = WAIT_INTERVAL) {

  const debounceRef = useRef(new Debounce<T>(onChange, waitInterval));
  useEffect(() => () => debounceRef.current.reset(), []);

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
