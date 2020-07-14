import { createAction } from '@reduxjs/toolkit';
import { AppThunkAction, AppThunkDispatch } from '../types';
import { Action, ActionComponent } from '../types/model';
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

export const actionPrimary = (windowId: string, controlId: string): AppThunkAction => (dispatch, getState) =>
  dispatchAction(dispatch, getWindowControl(getState(), windowId, controlId).primaryAction);

export const actionSecondary = (windowId: string, controlId: string): AppThunkAction => (dispatch, getState) =>
  dispatchAction(dispatch, getWindowControl(getState(), windowId, controlId).secondaryAction);
