import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, Update, ProjectType } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const pushUpdates = createAction<Update[]>(ActionTypes.PUSH_UPDATES);

export const createNewProject = createAsyncAction<{ type: ProjectType; id: string; }>(ActionTypes.CREATE_NEW);
export const duplicateProject = createAsyncAction<{ type: ProjectType; id: string; newId: string; }>(ActionTypes.DUPLICATE);
export const renameProject = createAsyncAction<{ type: ProjectType; id: string; newId: string; }>(ActionTypes.RENAME);
export const deleteProject = createAsyncAction<{ type: ProjectType; id: string; }>(ActionTypes.DELETE);
