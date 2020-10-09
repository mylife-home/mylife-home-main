import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, InstanceInfo } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const setInstance = createAction<{ instanceName: string, data: InstanceInfo; }>(ActionTypes.SET_INSTANCE);
export const clearInstance = createAction<{ instanceName: string; }>(ActionTypes.CLEAR_INSTANCE);
