import { createAction } from '@reduxjs/toolkit';
import { Action, ActionComponent } from '../../../../shared/model';
import { AppThunkAction, AppThunkDispatch } from '../types';
import { ACTION_COMPONENT } from '../types/actions';
import { getWindowControl } from '../selectors/model';
import { viewChange, viewPopup } from './view';

const actionComponent = createAction<ActionComponent>(ACTION_COMPONENT);

function dispatchAction(dispatch: AppThunkDispatch, action: Action) {
  if (!action) {
    return;
  }

  const { window, component } = action;
  if (window) {
    if (window.popup) {
      dispatch(viewPopup(window.id));
    } else {
      dispatch(viewChange(window.id));
    }
    return;
  }

  if (component) {
    dispatch(actionComponent(component));
    return;
  }
}

export const actionPrimary = (window: string, control: string): AppThunkAction => (dispatch, getState) =>
  dispatchAction(dispatch, getWindowControl(getState(), { window, control }).primaryAction);

export const actionSecondary = (window: string, control: string): AppThunkAction => (dispatch, getState) =>
  dispatchAction(dispatch, getWindowControl(getState(), { window, control }).secondaryAction);
