import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, Position, UpdateProjectNotification, CoreBindingData, DeployData, BulkUpdatesData, ImportFromProjectConfig } from './types';

export const setNotifier = createAction<{ id: string; notifierId: string; }>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<{ id: string; }>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<{ id: string; update: UpdateProjectNotification }[]>(ActionTypes.UPDATE_PROJECT);

export const prepareImportFromProject = createAsyncAction<{ id: string; config: ImportFromProjectConfig }, BulkUpdatesData>(ActionTypes.PREPARE_IMPORT_FROM_PROJECT);
export const prepareRefreshToolboxFromOnline = createAsyncAction<{ id: string; }, BulkUpdatesData>(ActionTypes.PREPARE_REFRESH_TOOLBOX_FROM_ONLINE);
export const applyBulkUpdates = createAsyncAction<{ id: string; serverData: unknown; }, any>(ActionTypes.APPLY_BULK_UPDATES);
export const deployToFiles = createAsyncAction<{ id: string; }, { files: string[] }>(ActionTypes.DEPLOY_TO_FILES);
export const prepareDeployToOnline = createAsyncAction<{ id: string; }, DeployData>(ActionTypes.PREPARE_DEPLOY_TO_ONLINE);
export const applyDeployToOnline = createAsyncAction<{ id: string; serverData: unknown; }, any>(ActionTypes.APPLY_DEPLOY_TO_ONLINE);

export const setComponent = createAsyncAction<{ id: string; componentId: string; pluginId: string; position: Position; }>(ActionTypes.SET_COMPONENT);
export const moveComponent = createAsyncAction<{ id: string; componentId: string; position: Position; }>(ActionTypes.MOVE_COMPONENT);
export const configureComponent = createAsyncAction<{ id: string; componentId: string; configId: string; configValue: any }>(ActionTypes.CONFIGURE_COMPONENT);
export const renameComponent = createAsyncAction<{ id: string; componentId: string; newId: string }>(ActionTypes.RENAME_COMPONENT);
export const clearComponent = createAsyncAction<{ id: string; componentId: string; }>(ActionTypes.CLEAR_COMPONENT);
export const setBinding = createAsyncAction<{ id: string; binding: CoreBindingData; }>(ActionTypes.SET_BINDING);
export const clearBinding = createAsyncAction<{ id: string; bindingId: string; }>(ActionTypes.CLEAR_BINDING);
export const updateToolbox = createAsyncAction<{ id: string; itemType: 'instance' | 'plugin'; itemId: string; action: 'show' | 'hide' | 'delete' }>(ActionTypes.UPDATE_TOOLBOX);
