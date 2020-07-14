import { useMemo } from 'react';
import InputManager from '../utils/input-manager';

type InputActionCallback = () => void;

export function useInputActions(onActionPrimary: InputActionCallback, onActionSecondary: InputActionCallback) {
  return useMemo(() => {
    const inputManager = new InputManager();
    inputManager.config = {
      s: onActionPrimary,
      l: onActionSecondary,
      ss: onActionSecondary,
    };
    
    const onTouchStart=(e: React.TouchEvent) => {
      e.preventDefault();
      inputManager.down();
    };

    const onTouchEnd=(e: React.TouchEvent) => {
      e.preventDefault();
      inputManager.up();
    };

    const onMouseDown=(e: React.MouseEvent) => {
      e.preventDefault();
      inputManager.down();
    };

    const onMouseUp=(e: React.MouseEvent) => {
      e.preventDefault();
      inputManager.up();
    };

    return { onTouchStart, onTouchEnd, onMouseDown, onMouseUp };
  }, [onActionPrimary, onActionSecondary]);
}

