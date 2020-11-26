import { createAction } from '@reduxjs/toolkit';
import { ActionTypes } from './types';

export const online = createAction<boolean>(ActionTypes.ONLINE);
export const beginRequest = createAction<{ id: string; service: string; }>(ActionTypes.BEGIN_REQUEST);
export const endRequest = createAction<string>(ActionTypes.END_REQUEST);
export const setError = createAction<Error>(ActionTypes.SET_ERROR);
export const clearError = createAction(ActionTypes.CLEAR_ERROR);