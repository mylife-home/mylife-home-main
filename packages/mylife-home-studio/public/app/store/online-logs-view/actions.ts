import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, LogRecord } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const addRecord = createAction<LogRecord>(ActionTypes.ADD_RECORD);