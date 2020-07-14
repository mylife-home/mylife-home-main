import { createAction } from '@reduxjs/toolkit';
import { AppThunkAction } from '../types';
import { VIEW_POPUP, VIEW_CLOSE, VIEW_CHANGE } from '../types/view';
import { getView } from '../selectors/view';
import { isMobile } from '../../utils/detect-browser';
import { navigate } from './navigation';

const internalViewClose = createAction(VIEW_CLOSE);
export const viewPopup = createAction<string>(VIEW_POPUP);
export const viewNavigationChange = createAction<string>(VIEW_CHANGE);

export const viewInit = (defaultWindow: any): AppThunkAction => (dispatch, getState) => {
  // if no view set, set to default view
  const state = getState();
  const currentView = getView(state)[0];
  if (currentView) {
    return;
  }

  const defaultWindowId = isMobile ? defaultWindow.mobile : defaultWindow.desktop;
  console.log(`using default window: ${defaultWindowId}`); // eslint-disable-line no-console
  dispatch(viewChange(defaultWindowId));
};

export const viewChange = (id: string) => {
  const pathname = `/${id}`;
  return navigate(pathname);
};

export const viewClose = (): AppThunkAction => (dispatch, getState) => {
  const state = getState();
  const view = getView(state);
  if (view.length <= 1) {
    console.error('Cannot close root window!'); // eslint-disable-line no-console
    return;
  }
  return dispatch(internalViewClose());
};
