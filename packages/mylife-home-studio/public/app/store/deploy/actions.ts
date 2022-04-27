import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, RecipeConfig, Update, UpdateUploadFilesProgress } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const pushUpdates = createAction<Update[]>(ActionTypes.PUSH_UPDATES);

export const setRecipe = createAsyncAction<{ id: string, config: RecipeConfig; }>(ActionTypes.SET_RECIPE);
export const clearRecipe = createAsyncAction<{ id: string }>(ActionTypes.CLEAR_RECIPE);
export const pinRecipe = createAsyncAction<{ id: string, value: boolean; }>(ActionTypes.PIN_RECIPE);
export const startRecipe = createAsyncAction<{ id: string }>(ActionTypes.START_RECIPE);
export const uploadFiles = createAsyncAction<File[]>(ActionTypes.UPLOAD_FILES);
export const downloadFile = createAction<{ id: string }>(ActionTypes.DOWNLOAD_FILE);
export const deleteFile = createAsyncAction<{ id: string }>(ActionTypes.DELETE_FILE);
export const renameFile = createAsyncAction<{id: string; newId: string; }>(ActionTypes.RENAME_FILE);

// upload internal actions
export const uploadFilesProgress = createAction<UpdateUploadFilesProgress>(ActionTypes.UPLOAD_FILES_PROGRESS);
export const downloadFileProgress = createAction<number>(ActionTypes.DOWNLOAD_FILE_PROGRESS);