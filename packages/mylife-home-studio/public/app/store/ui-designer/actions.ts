import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { UiValidationError, UpdateProjectNotification } from '../../../../shared/project-manager';
import { ActionTypes, DefaultWindow, UiResource, UiWindow } from './types';

export const setNotifier = createAction<{ id: string; notifierId: string; }>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<{ id: string; }>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<{ id: string; update: UpdateProjectNotification }[]>(ActionTypes.UPDATE_PROJECT);

export const validateProject = createAsyncAction<{ id: string; }, { errors: UiValidationError[] }>(ActionTypes.VALIDATE_PROJECT);
export const refreshComponentsFromOnline = createAsyncAction<{ id: string; }, any>(ActionTypes.REFRESH_COMPONENTS_FROM_ONLINE);
export const refreshComponentsFromProject = createAsyncAction<{ id: string; projectId: string }, any>(ActionTypes.REFRESH_COMPONENTS_FROM_PROJECT);
export const deployProject = createAsyncAction<{ id: string; }, any>(ActionTypes.DEPLOY_PROJECT);

export const setDefaultWindow = createAsyncAction<{ id: string; defaultWindow: DefaultWindow }>(ActionTypes.SET_DEFAULT_WINDOW);
export const setResource = createAsyncAction<{ id: string; resource: UiResource; }>(ActionTypes.SET_RESOURCE);
export const clearResource = createAsyncAction<{ id: string; resourceId: string; }>(ActionTypes.CLEAR_RESOURCE);
export const renameResource = createAsyncAction<{ id: string; resourceId: string; newId: string}>(ActionTypes.RENAME_RESOURCE);
export const setWindow = createAsyncAction<{ id: string; window: UiWindow; }>(ActionTypes.SET_WINDOW);
export const clearWindow = createAsyncAction<{ id: string; windowId: string; }>(ActionTypes.CLEAR_WINDOW);
export const renameWindow = createAsyncAction<{ id: string; windowId: string; newId: string}>(ActionTypes.RENAME_WINDOW);
