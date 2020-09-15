import { createAction } from '@reduxjs/toolkit';
import { ActionTypes } from './types';

export const online = createAction<boolean>(ActionTypes.ONLINE);

export const setError = createAction<Error>(ActionTypes.SET_ERROR)
export const clearError = createAction(ActionTypes.CLEAR_ERROR)