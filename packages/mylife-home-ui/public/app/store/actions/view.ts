import { createAction } from '@reduxjs/toolkit';
import { AppThunkAction } from '../types';
import { VIEW_POPUP, VIEW_CLOSE, VIEW_CHANGE } from '../types/view';
import { hasView, isViewPopup } from '../selectors/view';
import { isMobile } from '../../utils/detect-browser';
import { navigate } from './navigation';

const internalViewClose = createAction(VIEW_CLOSE);
export const viewPopup = createAction<string>(VIEW_POPUP);
export const viewNavigationChange = createAction<string>(VIEW_CHANGE);

export const viewInit = (defaultWindow: any): AppThunkAction => (dispatch, getState) => {
  // if no view set, set to default view
  const state = getState();
  if (hasView(state)) {
    return;
  }

  const defaultWindowId = isMobile ? defaultWindow.mobile : defaultWindow.desktop;
  console.log(`using default window: ${defaultWindowId}`); // eslint-disable-line no-console

  dispatch(viewChange(defaultWindowId));
};

export const viewChange = (id: string) => {
  return navigate(id);
};

export const viewClose = (): AppThunkAction => (dispatch, getState) => {
  const state = getState();
  if (!isViewPopup(state)) {
    console.error('Cannot close root window!'); // eslint-disable-line no-console
    return;
  }

  dispatch(internalViewClose());
};
