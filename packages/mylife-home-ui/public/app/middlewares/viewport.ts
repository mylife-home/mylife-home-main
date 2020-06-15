import { Middleware } from 'redux';
import { actionTypes } from '../constants';
import { getWindow } from '../selectors';
import { isMobile } from '../utils/detect-browser';
import { setDimensions } from '../utils/viewport';

export function createViewportMiddleware(): Middleware {
  // nothing to do on desktop
  if (!isMobile) {
    return store => next => action => next(action);
  }

  return store => next => action => {
    switch (action.type) {
      case actionTypes.VIEW_CHANGE: {
        const state = store.getState();
        const window = getWindow(state, { window: action.payload });
        setDimensions(window.width, window.height);
      }
    }

    return next(action);
  };
}
