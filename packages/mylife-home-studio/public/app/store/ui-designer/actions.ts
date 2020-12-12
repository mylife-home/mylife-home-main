import { createAction } from '@reduxjs/toolkit';
import { ActionTypes } from './types';

export const setNotifier = createAction<{ id: string; notifierId: string; }>(ActionTypes.SET_NOTIFIER);
export const clearNotifier = createAction<{ id: string; notifierId: string; }>(ActionTypes.CLEAR_NOTIFICATION);
export const removeOpenedProject = createAction<{ id: string; }>(ActionTypes.REMOVE_OPENED_PROJECT);
