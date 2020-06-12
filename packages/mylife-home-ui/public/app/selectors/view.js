'use strict';

import { getWindowDisplay } from './windows';

export const getView = (state) => state.view;

export const getViewDisplay = (state) => {
  const view = getView(state);
  if(!view.size) { return null; }
  return {
    main   : getWindowDisplay(state, { window : view.first() }),
    popups : view.filter(it => it != view.first()).map(window => getWindowDisplay(state, { window })).toArray()
  };
};
