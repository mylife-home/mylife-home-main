import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, Status } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const setStatus = createAction<Status>(ActionTypes.SET_STATUS);
