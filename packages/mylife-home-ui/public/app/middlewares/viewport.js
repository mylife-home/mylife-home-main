'use strict';

import { actionTypes } from '../constants';
import { getWindow } from '../selectors';
import browser from '../utils/detect-browser.js';
import viewport from '../utils/viewport.js';

function factory() {
  // nothing to do on desktop
  if(!browser.isMobile) {
    return (/*store*/) => next => action => next(action);
  }

  return store => next => action => {
    next(action);

    switch (action.type) {
      case actionTypes.VIEW_CHANGE: {
        const state = store.getState();
        const window = getWindow(state, { window : action.payload });
        viewport.setDimensions(window.width, window.height);
      }
    }
  };
}

export default factory();
