import { AppState } from '../types';
import { VView } from '../types/view';
import { getWindowDisplay } from './windows';

export const getView = (state: AppState) => state.view;

export const getViewDisplay = (state: AppState): VView => {
  const view = getView(state);
  if(!view.size) { return null; }
  return {
    main   : getWindowDisplay(state, { window : view.first() }),
    popups : view.skip(1).map(window => getWindowDisplay(state, { window })).toArray()
  };
};
