import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, GitDiff, GitStatus } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const setStatus = createAction<GitStatus>(ActionTypes.SET_STATUS);
export const refresh = createAsyncAction(ActionTypes.REFRESH);
export const diff = createAsyncAction<void, GitDiff>(ActionTypes.DIFF);
