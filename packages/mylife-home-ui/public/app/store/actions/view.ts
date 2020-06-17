'use strict';

import { createAction } from '@reduxjs/toolkit';
import { push as routerPush } from 'react-router-redux';
import { AppThunkAction, AppState, AppThunkDispatch } from '../types';
import { VIEW_POPUP, VIEW_CLOSE, VIEW_CHANGE } from '../types/view';
import { getView } from '../selectors/view';
import { resourceQuery } from './resources';
import { windowLoad } from './windows';
import { isMobile } from '../../utils/detect-browser';

const internalViewPopup  = createAction<string>(VIEW_POPUP);
const internalViewClose  = createAction(VIEW_CLOSE);
const internalViewChange = createAction<string>(VIEW_CHANGE);

function getPathView(state: AppState) {
  const routingState = state.routing.location;
  if(!routingState) { return null; }
  let { pathname } = routingState;
  pathname = pathname.substr(1);
  return pathname;
}

function getDefaultView(dispatch: AppThunkDispatch, done: (err: Error, defaultWindow?: string) => void) {
  return dispatch(resourceQuery({ resource: 'default_window', done: (err, data) => {
    if(err) { return done(err); }
    const windows = JSON.parse(data);
    return done(null, isMobile ? windows.mobile : windows.desktop);
  }}));
}

export const viewInit = (): AppThunkAction => (dispatch, getState) => {
  const state = getState();
  if(getPathView(state)) {
    console.log('window already opened, not using default window'); // eslint-disable-line no-console
    return;
  }

  return getDefaultView(dispatch, (err, defaultWindow) => {
    if(err) { return console.error(err); } // eslint-disable-line no-console

    console.log(`using default window: ${defaultWindow}`); // eslint-disable-line no-console
    dispatch(viewChange(defaultWindow));
  });
};

export const viewChange = (id: string): AppThunkAction => (dispatch, getState) => {
  const pathname = `/${id}`;
  const state = getState();
  const routingState = state.routing.location;
  if(routingState && routingState.pathname === pathname) {
    return dispatch(viewNavigationChange(id)); // cannot change to same path
  }
  dispatch(routerPush(pathname));
};

export const viewNavigationChange = (id: string): AppThunkAction => (dispatch) => {
  return dispatch(windowLoad(id, (err) => {
    if(err) { return console.error(err); } // eslint-disable-line no-console
    return dispatch(internalViewChange(id));
  }));
};

export const viewPopup = (id: string): AppThunkAction => (dispatch) => {
  return dispatch(windowLoad(id, (err) => {
    if(err) { return console.error(err); } // eslint-disable-line no-console
    return dispatch(internalViewPopup(id));
  }));
};

export const viewClose = (): AppThunkAction => (dispatch, getState) => {
  const state = getState();
  const view = getView(state);
  if(view.size <= 1) {
    console.error('Cannot close root window!'); // eslint-disable-line no-console
    return;
  }
  return dispatch(internalViewClose());
};
