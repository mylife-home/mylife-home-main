import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, Component, Plugin, State } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const setPlugin = createAction<{ plugin: Plugin; }>(ActionTypes.SET_PLUGIN);
export const clearPlugin = createAction<{ instanceName: string; id: string; }>(ActionTypes.CLEAR_PLUGIN);
export const setComponent = createAction<{ component: Component; }>(ActionTypes.SET_COMPONENT);
export const clearComponent = createAction<{ instanceName: string; id: string; }>(ActionTypes.CLEAR_COMPONENT);
export const setState = createAction<{ state: State }>(ActionTypes.SET_STATE);