import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, Update, ProjectType } from './types';

export const setNotification = createAction<string>(ActionTypes.SET_NOTIFICATION);
export const clearNotification = createAction(ActionTypes.CLEAR_NOTIFICATION);
export const pushUpdates = createAction<Update[]>(ActionTypes.PUSH_UPDATES);

export const importV1Project = createAction<{ type: ProjectType; content: string; }>(ActionTypes.IMPORT_V1);
export const createNewProject = createAction<{ type: ProjectType; id: string; }>(ActionTypes.CREATE_NEW);
export const renameProject = createAction<{ type: ProjectType; id: string; newId: string; }>(ActionTypes.RENAME);
export const deleteProject = createAction<{ type: ProjectType; id: string; }>(ActionTypes.DELETE);
