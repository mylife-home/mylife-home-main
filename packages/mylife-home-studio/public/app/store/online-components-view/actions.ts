import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, Component, Plugin } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const SetPlugin = createAction<{ instanceName: string, plugin: Plugin; }>(ActionTypes.SET_PLUGIN);
export const ClearPlugin = createAction<{ instanceName: string; id: string; }>(ActionTypes.CLEAR_PLUGIN);
export const SetComponent = createAction<{ instanceName: string, component: Component; }>(ActionTypes.SET_COMPONENT);
export const ClearComponent = createAction<{ instanceName: string; id: string; }>(ActionTypes.CLEAR_COMPONENT);
export const SetState = createAction<{ instanceName: string; component: string; name: string, value: any }>(ActionTypes.SET_STATE);