import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { UpdateProjectNotification } from '../../../../shared/project-manager';
import { ActionTypes, DefaultWindow, UiResource, UiWindow } from './types';

export const setNotifier = createAction<{ id: string; notifierId: string; }>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<{ id: string; }>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<{ id: string; update: UpdateProjectNotification }[]>(ActionTypes.UPDATE_PROJECT);

export const validateProject = createAsyncAction<{ id: string; }>(ActionTypes.VALIDATE_PROJECT);
// TODO: component data
// TODO: deployment

export const setDefaultWindow = createAction<{ id: string; defaultWindow: DefaultWindow }>(ActionTypes.SET_DEFAULT_WINDOW);
export const setResource = createAction<{ id: string; resource: UiResource; }>(ActionTypes.SET_RESOURCE);
export const clearResource = createAction<{ id: string; resourceId: string; }>(ActionTypes.CLEAR_RESOURCE);
export const renameResource = createAction<{ id: string; resourceId: string; newId: string}>(ActionTypes.RENAME_RESOURCE);
export const setWindow = createAction<{ id: string; window: UiWindow; }>(ActionTypes.SET_WINDOW);
export const clearWindow = createAction<{ id: string; windowId: string; }>(ActionTypes.CLEAR_WINDOW);
export const renameWindow = createAction<{ id: string; windowId: string; newId: string}>(ActionTypes.RENAME_WINDOW);
