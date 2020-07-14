import { AppState } from '../types';
import { VView } from '../types/view';
import { getWindowDisplay } from './model';

export const getView = (state: AppState) => state.view;

export const getViewDisplay = (state: AppState): VView => {
  const view = getView(state);
  if (!view.length) { return null; }

  const main = getWindowDisplay(state, { window: view[0] });
  if (!main) {
    // we have a location, but the model is not loaded
    return null;
  }

  const popups = view.slice(1, view.length).map(window => getWindowDisplay(state, { window }));
  return { main, popups };
};
