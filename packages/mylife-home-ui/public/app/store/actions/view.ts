'use strict';

import { createAction } from '@reduxjs/toolkit';
import { push as routerPush } from 'react-router-redux';
import { AppThunkAction, AppState } from '../types';
import { VIEW_POPUP, VIEW_CLOSE, VIEW_CHANGE } from '../types/view';
import { getView } from '../selectors/view';
import { isMobile } from '../../utils/detect-browser';

const internalViewClose = createAction(VIEW_CLOSE);
export const viewPopup = createAction<string>(VIEW_POPUP);
export const viewNavigationChange = createAction<string>(VIEW_CHANGE);

function getPathView(state: AppState) {
  const routingState = state.routing.location;
  if (!routingState) { return null; }
  let { pathname } = routingState;
  pathname = pathname.substr(1);
  return pathname;
}

export const viewInit = (defaultWindow: any): AppThunkAction => (dispatch, getState) => {
  const state = getState();
  if (getPathView(state)) {
    console.log('window already opened, not using default window'); // eslint-disable-line no-console
    return;
  }

  const defaultWindowId = isMobile ? defaultWindow.mobile : defaultWindow.desktop;

  console.log(`using default window: ${defaultWindowId}`); // eslint-disable-line no-console
  dispatch(viewChange(defaultWindowId));
};

export const viewChange = (id: string): AppThunkAction => (dispatch, getState) => {
  const pathname = `/${id}`;
  const state = getState();
  const routingState = state.routing.location;
  if (routingState && routingState.pathname === pathname) {
    return dispatch(viewNavigationChange(id)); // cannot change to same path
  }
  dispatch(routerPush(pathname));
};

export const viewClose = (): AppThunkAction => (dispatch, getState) => {
  const state = getState();
  const view = getView(state);
  if (view.size <= 1) {
    console.error('Cannot close root window!'); // eslint-disable-line no-console
    return;
  }
  return dispatch(internalViewClose());
};
