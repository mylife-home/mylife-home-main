import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { UiValidationError } from '../../../../shared/project-manager';
import { ActionTypes, RefreshData, ActionPayloads } from './types';

export const setNotifier = createAction<ActionPayloads.SetNotifier>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<ActionPayloads.RemoveOpenedProject>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<ActionPayloads.UpdateProject>(ActionTypes.UPDATE_PROJECT);

export const validateProject = createAsyncAction<ActionPayloads.ValidateProject, { errors: UiValidationError[]; }>(ActionTypes.VALIDATE_PROJECT);
export const refreshComponentsFromOnline = createAsyncAction<ActionPayloads.RefreshComponentsFromOnline, RefreshData>(ActionTypes.REFRESH_COMPONENTS_FROM_ONLINE);
export const refreshComponentsFromProject = createAsyncAction<ActionPayloads.RefreshComponentsFromProject, RefreshData>(ActionTypes.REFRESH_COMPONENTS_FROM_PROJECT);
export const applyRefreshComponents = createAsyncAction<ActionPayloads.ApplyRefreshComponents, any>(ActionTypes.APPLY_REFRESH_COMPONENTS);
export const deployProject = createAsyncAction<ActionPayloads.DeployProject, any>(ActionTypes.DEPLOY_PROJECT);
export const select = createAction<ActionPayloads.Select>(ActionTypes.SELECT);

export const setDefaultWindow = createAsyncAction<ActionPayloads.SetDefaultWindow>(ActionTypes.SET_DEFAULT_WINDOW);
export const setResource = createAsyncAction<ActionPayloads.SetResource>(ActionTypes.SET_RESOURCE);
export const clearResource = createAsyncAction<ActionPayloads.ClearResource>(ActionTypes.CLEAR_RESOURCE);
export const renameResource = createAsyncAction<ActionPayloads.RenameResource>(ActionTypes.RENAME_RESOURCE);
export const setStyle = createAsyncAction<ActionPayloads.SetStyle>(ActionTypes.SET_STYLE);
export const clearStyle = createAsyncAction<ActionPayloads.ClearStyle>(ActionTypes.CLEAR_STYLE);
export const renameStyle = createAsyncAction<ActionPayloads.RenameStyle>(ActionTypes.RENAME_STYLE);
export const newWindow = createAsyncAction<ActionPayloads.NewWindow>(ActionTypes.NEW_WINDOW);
export const clearWindow = createAsyncAction<ActionPayloads.ClearWindow>(ActionTypes.CLEAR_WINDOW);
export const renameWindow = createAsyncAction<ActionPayloads.RenameWindow>(ActionTypes.RENAME_WINDOW);
export const cloneWindow = createAsyncAction<ActionPayloads.CloneWindow>(ActionTypes.CLONE_WINDOW);
export const setWindowProperties = createAsyncAction<ActionPayloads.SetWindowProperties>(ActionTypes.SET_WINDOW_PROPERTIES);
export const newControl = createAsyncAction<ActionPayloads.NewControl>(ActionTypes.NEW_CONTROL);
export const clearControl = createAsyncAction<ActionPayloads.ClearControl>(ActionTypes.CLEAR_CONTROL);
export const renameControl = createAsyncAction<ActionPayloads.RenameControl>(ActionTypes.RENAME_CONTROL);
export const cloneControl = createAsyncAction<ActionPayloads.CloneControl>(ActionTypes.CLONE_CONTROL);
export const setControlProperties = createAsyncAction<ActionPayloads.SetControlProperties>(ActionTypes.SET_CONTROL_PROPERTIES);
