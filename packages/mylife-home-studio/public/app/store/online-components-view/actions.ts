import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, Update } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const pushUpdates = createAction<Update[]>(ActionTypes.PUSH_UPDATES);
