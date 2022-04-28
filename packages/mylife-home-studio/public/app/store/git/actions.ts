import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, GitDiff, GitStatus } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const setStatus = createAction<GitStatus>(ActionTypes.SET_STATUS);
export const gitRefresh = createAsyncAction(ActionTypes.REFRESH);
export const gitDiff = createAsyncAction<void, GitDiff>(ActionTypes.DIFF);
export const gitDiffDataSet = createAction<GitDiff>(ActionTypes.DIFF_DATA_SET);
export const gitDiffDataClear = createAction(ActionTypes.DIFF_DATA_CLEAR);
