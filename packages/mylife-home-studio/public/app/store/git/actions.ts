import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, ActionPayloads, GitDiff, GitStatus } from './types';

export const setNotification = createAction<ActionPayloads.SetNotification>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction<ActionPayloads.ClearNotification>(ActionTypes.CLEAR_NOTIFICATION);
export const setStatus = createAction<ActionPayloads.SetStatus>(ActionTypes.SET_STATUS);
export const gitRefresh = createAsyncAction(ActionTypes.REFRESH);
export const gitDiff = createAsyncAction<void, GitDiff>(ActionTypes.DIFF);
export const gitDiffDataSet = createAction<ActionPayloads.GitDiffDataSet>(ActionTypes.DIFF_DATA_SET);
export const gitDiffDataClear = createAction<ActionPayloads.GitDiffDataClear>(ActionTypes.DIFF_DATA_CLEAR);
export const gitDiffStage = createAction<ActionPayloads.GitDiffStage>(ActionTypes.DIFF_STAGE);
