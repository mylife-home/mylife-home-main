'use strict';

import { createAction } from 'redux-actions';
import { constants, selectors } from 'mylife-home-ui-common';
import { viewChange, viewPopup } from './view';

const actionComponent = createAction(constants.actionTypes.ACTION_COMPONENT);

function dispatchAction(dispatch, action) {
  if(!action) { return; }

  if(action.window) {
    return dispatch((action.popup ? viewPopup : viewChange)(action.window));
  }

  if(action.component) {
    return dispatch(actionComponent({
      id   : action.component,
      name : action.action
      //args :[]
    }));
  }
}

export const actionPrimary   = (window, control) => (dispatch, getState) => dispatchAction(dispatch, selectors.getWindowControl(getState(), { window, control }).primaryAction);
export const actionSecondary = (window, control) => (dispatch, getState) => dispatchAction(dispatch, selectors.getWindowControl(getState(), { window, control }).secondaryAction);
