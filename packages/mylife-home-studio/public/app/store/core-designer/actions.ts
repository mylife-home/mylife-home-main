import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, Position, UpdateProjectNotification, CoreBindingData, OnlineDeployData, FilesDeployData, BulkUpdatesData, BulkUpdatesStats, ImportFromOnlineConfig, ImportFromProjectConfig, coreValidation, FilesDeployResult, Selection } from './types';

export const setNotifier = createAction<{ id: string; notifierId: string; }>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<{ id: string; }>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<{ id: string; update: UpdateProjectNotification }[]>(ActionTypes.UPDATE_PROJECT);

export const prepareImportFromProject = createAsyncAction<{ id: string; config: ImportFromProjectConfig }, BulkUpdatesData>(ActionTypes.PREPARE_IMPORT_FROM_PROJECT);
export const prepareImportFromOnline = createAsyncAction<{ id: string; config: ImportFromOnlineConfig }, BulkUpdatesData>(ActionTypes.PREPARE_IMPORT_FROM_ONLINE);
export const applyBulkUpdates = createAsyncAction<{ id: string; selection: string[]; serverData: unknown; }, BulkUpdatesStats>(ActionTypes.APPLY_BULK_UPDATES);
export const validateProject = createAsyncAction<{ id: string; }, { validation: coreValidation.Item[]; }>(ActionTypes.VALIDATE_PROJECT);
export const prepareDeployToFiles = createAsyncAction<{ id: string; }, FilesDeployData>(ActionTypes.PREPARE_DEPLOY_TO_FILES);
export const applyDeployToFiles = createAsyncAction<{ id: string; bindingsInstanceName?: string; serverData: unknown; }, FilesDeployResult>(ActionTypes.APPLY_DEPLOY_TO_FILES);
export const prepareDeployToOnline = createAsyncAction<{ id: string; }, OnlineDeployData>(ActionTypes.PREPARE_DEPLOY_TO_ONLINE);
export const applyDeployToOnline = createAsyncAction<{ id: string; serverData: unknown; }, void>(ActionTypes.APPLY_DEPLOY_TO_ONLINE);
export const select = createAction<{ id: string; selection: Selection; }>(ActionTypes.SELECT);
export const toggleComponentSelection = createAction<{ id: string; componentId: string; }>(ActionTypes.TOGGLE_COMPONENT_SELECTION);

export const setComponent = createAsyncAction<{ tabId: string; componentId: string; pluginId: string; position: Position; }>(ActionTypes.SET_COMPONENT);
export const moveComponents = createAsyncAction<{ componentsIds: string[]; delta: Position; }>(ActionTypes.MOVE_COMPONENTS);
export const configureComponent = createAsyncAction<{ componentId: string; configId: string; configValue: any }>(ActionTypes.CONFIGURE_COMPONENT);
export const renameComponent = createAsyncAction<{ componentId: string; newId: string }>(ActionTypes.RENAME_COMPONENT); // Note: newId is new componentId only, not full id
export const clearComponents = createAsyncAction<{ componentsIds: string[]; }>(ActionTypes.CLEAR_COMPONENTS);
export const setBinding = createAsyncAction<{ tabId: string; binding: CoreBindingData; }>(ActionTypes.SET_BINDING);
export const clearBinding = createAsyncAction<{ bindingId: string; }>(ActionTypes.CLEAR_BINDING);
export const updateToolbox = createAsyncAction<{ itemType: 'instance' | 'plugin'; itemId: string; action: 'show' | 'hide' | 'delete' }>(ActionTypes.UPDATE_TOOLBOX);
