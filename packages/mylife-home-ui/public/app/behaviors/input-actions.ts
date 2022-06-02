import { useMemo, useState, useCallback } from 'react';
import InputManager from '../utils/input-manager';

type InputActionCallback = () => void;

export function useInputActions(onActionPrimary: InputActionCallback, onActionSecondary: InputActionCallback) {
  const [isActive, setActive] = useState(false);

  const inputManager = useMemo(() => {
    const inputManager = new InputManager();
    inputManager.config = {
      s: onActionPrimary,
      l: onActionSecondary,
      ss: onActionSecondary,
    };

    return inputManager;
  }, [onActionPrimary, onActionSecondary]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    inputManager.down();
    setActive(true);
  }, [inputManager, setActive]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    inputManager.up();
    setActive(false);
  }, [inputManager, setActive]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    inputManager.down();
    setActive(true);
  }, [inputManager, setActive]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    inputManager.up();
    setActive(false);
  }, [inputManager, setActive]);

  return { isActive, onTouchStart, onTouchEnd, onMouseDown, onMouseUp };
}
