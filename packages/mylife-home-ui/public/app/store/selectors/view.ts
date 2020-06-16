import { AppState } from '../types';
import { getWindowDisplay } from './windows';

export const getView = (state: AppState) => state.view;

export const getViewDisplay = (state: AppState) => {
  const view = getView(state);
  if(!view.size) { return null; }
  return {
    main   : getWindowDisplay(state, { window : view.first() }),
    popups : view.skip(1).map(window => getWindowDisplay(state, { window })).toArray()
  };
};
