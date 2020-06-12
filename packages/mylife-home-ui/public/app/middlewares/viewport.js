'use strict';

import { constants, selectors } from 'mylife-home-ui-common';

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
      case constants.actionTypes.VIEW_CHANGE: {
        const state = store.getState();
        const window = selectors.getWindow(state, { window : action.payload });
        viewport.setDimensions(window.width, window.height);
      }
    }
  };
}

export default factory();
