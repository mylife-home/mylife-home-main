import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, GitStatus } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const setStatus = createAction<GitStatus>(ActionTypes.SET_STATUS);
