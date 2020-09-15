import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, LogItem } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const addLogItems = createAction<LogItem[]>(ActionTypes.ADD_LOG_ITEMS);
