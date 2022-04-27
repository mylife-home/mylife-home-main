import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, Update } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const pushUpdates = createAction<Update[]>(ActionTypes.PUSH_UPDATES);
export const executeSystemRestart = createAsyncAction<{ instanceName: string, failSafe: boolean; }>(ActionTypes.EXECUTE_SYSTEM_RESTART);
