import { useEffect, useState, useRef } from 'react';

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

  const componentChange = (newValue: T) => {
    setStateValue(newValue);
    debounceRef.current.call(newValue);
  };

  const flush = () => {
    debounceRef.current.forceCall(stateValue);
  };

  return { componentValue: stateValue, componentChange, flush };
}
