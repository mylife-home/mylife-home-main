import { useRef, useEffect } from 'react';

export type Callback = () => void;

export function useInterval(callback: Callback, delay: number) {
  const savedCallback = useRef<Callback>();

  useEffect(
    () => {
      savedCallback.current = callback;
    },
    [callback]
  );

  useEffect(
    () => {
      const handler = () => savedCallback.current();

      if (delay !== null) {
        const id = setInterval(handler, delay);
        return () => clearInterval(id);
      }
    },
    [delay]
  );
};