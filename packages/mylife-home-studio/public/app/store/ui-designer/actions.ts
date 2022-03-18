import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { UiValidationError, UpdateProjectNotification } from '../../../../shared/project-manager';
import { ActionTypes, DefaultWindow, RefreshData, UiResource, UiWindow, Selection } from './types';

export const setNotifier = createAction<{ tabId: string; notifierId: string; }>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<{ tabId: string; }>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<{ tabId: string; update: UpdateProjectNotification; }[]>(ActionTypes.UPDATE_PROJECT);

export const validateProject = createAsyncAction<{ tabId: string; }, { errors: UiValidationError[]; }>(ActionTypes.VALIDATE_PROJECT);
export const refreshComponentsFromOnline = createAsyncAction<{ tabId: string; }, RefreshData>(ActionTypes.REFRESH_COMPONENTS_FROM_ONLINE);
export const refreshComponentsFromProject = createAsyncAction<{ tabId: string; projectId: string; }, RefreshData>(ActionTypes.REFRESH_COMPONENTS_FROM_PROJECT);
export const applyRefreshComponents = createAsyncAction<{ tabId: string; serverData: unknown; }, any>(ActionTypes.APPLY_REFRESH_COMPONENTS);
export const deployProject = createAsyncAction<{ tabId: string; }, any>(ActionTypes.DEPLOY_PROJECT);
export const select = createAction<{ tabId: string; selection: Selection; }>(ActionTypes.SELECT);

export const setDefaultWindow = createAsyncAction<{ tabId: string; defaultWindow: DefaultWindow; }>(ActionTypes.SET_DEFAULT_WINDOW);
export const setResource = createAsyncAction<{ tabId: string; resource: UiResource; }>(ActionTypes.SET_RESOURCE);
export const clearResource = createAsyncAction<{ resourceId: string; }>(ActionTypes.CLEAR_RESOURCE);
export const renameResource = createAsyncAction<{ resourceId: string; newId: string; }>(ActionTypes.RENAME_RESOURCE);
export const setWindow = createAsyncAction<{ tabId: string; window: UiWindow; }>(ActionTypes.SET_WINDOW);
export const clearWindow = createAsyncAction<{ windowId: string; }>(ActionTypes.CLEAR_WINDOW);
export const renameWindow = createAsyncAction<{ windowId: string; newId: string; }>(ActionTypes.RENAME_WINDOW);
