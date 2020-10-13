import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, NetComponent, NetPlugin } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const setPlugin = createAction<{ instanceName: string; plugin: NetPlugin; }>(ActionTypes.SET_PLUGIN);
export const clearPlugin = createAction<{ instanceName: string; id: string; }>(ActionTypes.CLEAR_PLUGIN);
export const setComponent = createAction<{ instanceName: string; component: NetComponent; }>(ActionTypes.SET_COMPONENT);
export const clearComponent = createAction<{ instanceName: string; id: string; }>(ActionTypes.CLEAR_COMPONENT);
export const setState = createAction<{ instanceName: string; component: string; name: string; value: any; }>(ActionTypes.SET_STATE);