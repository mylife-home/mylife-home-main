'use strict';

import { createAction } from 'redux-actions';
import { push as routerPush } from 'react-router-redux';
import { constants, actions, selectors } from 'mylife-home-ui-common';

import browser from '../utils/detect-browser.js';

const internalViewPopup  = createAction(constants.actionTypes.VIEW_POPUP);
const internalViewClose  = createAction(constants.actionTypes.VIEW_CLOSE);
const internalViewChange = createAction(constants.actionTypes.VIEW_CHANGE);

function getPathView(state) {
  const routingState = state.routing.locationBeforeTransitions;
  if(!routingState) { return null; }
  let { pathname } = routingState;
  pathname = pathname.substr(1);
  return pathname;
}

function getDefaultView(dispatch, done) {
  return dispatch(actions.resourceQuery({ resource: 'default_window', done: (err, data) => {
    if(err) { return done(err); } // eslint-disable-line no-console
    const windows = JSON.parse(data);
    return done(null, browser.isMobile ? windows.mobile : windows.desktop);
  }}));
}

export const viewInit = () => (dispatch, getState) => {
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

export const viewChange = (id) => (dispatch, getState) => {
  const pathname = `/${id}`;
  const state = getState();
  const routingState = state.routing.locationBeforeTransitions;
  if(routingState && routingState.pathname === pathname) {
    return dispatch(viewNavigationChange(id)); // cannot change to same path
  }
  dispatch(routerPush(pathname));
};

export const viewNavigationChange = (id) => (dispatch) => {
  return dispatch(actions.windowLoad(id, (err) => {
    if(err) { return console.error(err); } // eslint-disable-line no-console
    return dispatch(internalViewChange(id));
  }));
};

export const viewPopup = (id) => (dispatch) => {
  return dispatch(actions.windowLoad(id, (err) => {
    if(err) { return console.error(err); } // eslint-disable-line no-console
    return dispatch(internalViewPopup(id));
  }));
};

export const viewClose = () => (dispatch, getState) => {
  const state = getState();
  const view = selectors.getView(state);
  if(view.size <= 1) {
    console.error('Cannot close root window!'); // eslint-disable-line no-console
    return;
  }
  return dispatch(internalViewClose());
};
