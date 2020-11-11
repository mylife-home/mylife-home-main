import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, RecipeConfig, Update } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const pushUpdates = createAction<Update[]>(ActionTypes.PUSH_UPDATES);

export const setRecipe = createAction<{ id: string, config: RecipeConfig; }>(ActionTypes.SET_RECIPE);
export const clearRecipe = createAction<string>(ActionTypes.CLEAR_RECIPE);
export const pinRecipe = createAction<{ id: string, value: boolean; }>(ActionTypes.PIN_RECIPE);
export const startRecipe = createAction<string>(ActionTypes.START_RECIPE);
export const uploadFile = createAction(ActionTypes.UPLOAD_FILE);
export const downloadFile = createAction<string>(ActionTypes.DOWNLOAD_FILE);
export const deleteFile = createAction<string>(ActionTypes.DELETE_FILE);