import { createAction } from 'redux-actions';
import * as actionTypes from '../constants/action-types';

export const noop = createAction(actionTypes.NOOP);

export const clearError = createAction<void>(actionTypes.CLEAR_ERROR);
export const setOnline = createAction<boolean>(actionTypes.SET_ONLINE);
