import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, HistoryItem } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const addHistoryItems = createAction<HistoryItem[]>(ActionTypes.ADD_HISTORY_ITEMS);
