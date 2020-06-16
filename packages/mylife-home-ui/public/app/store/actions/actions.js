'use strict';

import { createAction } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';
import { getWindowControl } from '../selectors';
import { viewChange, viewPopup } from './view';

const actionComponent = createAction(actionTypes.ACTION_COMPONENT);

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

export const actionPrimary   = (window, control) => (dispatch, getState) => dispatchAction(dispatch, getWindowControl(getState(), { window, control }).primaryAction);
export const actionSecondary = (window, control) => (dispatch, getState) => dispatchAction(dispatch, getWindowControl(getState(), { window, control }).secondaryAction);
