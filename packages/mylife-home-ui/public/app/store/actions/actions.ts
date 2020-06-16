'use strict';

import { createAction } from '@reduxjs/toolkit';
import { AppThunkAction, AppThunkDispatch } from '../types';
import { ACTION_COMPONENT, ComponentAction } from '../types/actions';
import { Action } from '../types/windows';
import { getWindowControl } from '../selectors/windows';
import { viewChange, viewPopup } from './view';

const actionComponent = createAction<ComponentAction>(ACTION_COMPONENT);

function dispatchAction(dispatch: AppThunkDispatch, action: Action) {
  if (!action) {
    return;
  }

  if (action.window) {
    if (action.popup) {
      dispatch(viewPopup(action.window));
    } else {
      dispatch(viewChange(action.window));
    }
    return;
  }

  if (action.component) {
    const payload = { id: action.component, name: action.action };
    dispatch(actionComponent(payload));
    return;
  }
}

export const actionPrimary = (window: string, control: string): AppThunkAction => (dispatch, getState) =>
  dispatchAction(dispatch, getWindowControl(getState(), { window, control }).primaryAction);

export const actionSecondary = (window: string, control: string): AppThunkAction => (dispatch, getState) =>
  dispatchAction(dispatch, getWindowControl(getState(), { window, control }).secondaryAction);
