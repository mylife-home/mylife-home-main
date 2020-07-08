import { AppState } from '../types';
import { VView } from '../types/view';
import { getWindowDisplay } from './model';

export const getView = (state: AppState) => state.view;

export const getViewDisplay = (state: AppState): VView => {
  const view = getView(state);
  if (!view.size) { return null; }

  const main = getWindowDisplay(state, { window: view.first() });
  if (!main) {
    // we have a location, but the model is not loaded
    return null;
  }

  const popups = view.skip(1).map(window => getWindowDisplay(state, { window })).toArray();
  return { main, popups };
};
