import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, ActionPayloads, OnlineDeployData, FilesDeployData, BulkUpdatesData, BulkUpdatesStats, FilesDeployResult, CopyComponentsStats } from './types';

export const setNotifier = createAction<ActionPayloads.SetNotifier>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction<ActionPayloads.ClearAllNotifiers>(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<ActionPayloads.RemoveOpenedProject>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<ActionPayloads.UpdateProject>(ActionTypes.UPDATE_PROJECT);

export const prepareImportFromProject = createAsyncAction<ActionPayloads.PrepareImportFromProject, BulkUpdatesData>(ActionTypes.PREPARE_IMPORT_FROM_PROJECT);
export const prepareImportFromOnline = createAsyncAction<ActionPayloads.PrepareImportFromOnline, BulkUpdatesData>(ActionTypes.PREPARE_IMPORT_FROM_ONLINE);
export const applyBulkUpdates = createAsyncAction<ActionPayloads.ApplyBulkUpdates, BulkUpdatesStats>(ActionTypes.APPLY_BULK_UPDATES);
export const validateProject = createAsyncAction<ActionPayloads.ValidateProject>(ActionTypes.VALIDATE_PROJECT);
export const prepareDeployToFiles = createAsyncAction<ActionPayloads.PrepareDeployToFiles, FilesDeployData>(ActionTypes.PREPARE_DEPLOY_TO_FILES);
export const applyDeployToFiles = createAsyncAction<ActionPayloads.ApplyDeployToFiles, FilesDeployResult>(ActionTypes.APPLY_DEPLOY_TO_FILES);
export const prepareDeployToOnline = createAsyncAction<ActionPayloads.PrepareDeployToOnline, OnlineDeployData>(ActionTypes.PREPARE_DEPLOY_TO_ONLINE);
export const applyDeployToOnline = createAsyncAction<ActionPayloads.ApplyDeployToOnline>(ActionTypes.APPLY_DEPLOY_TO_ONLINE);
export const activateView = createAction<ActionPayloads.ActivateView>(ActionTypes.ACTIVATE_VIEW);
export const select = createAction<ActionPayloads.Select>(ActionTypes.SELECT);
export const selectComponent = createAction<ActionPayloads.SelectComponent>(ActionTypes.SELECT_COMPONENT);
export const toggleComponentSelection = createAction<ActionPayloads.ToggleComponentSelection>(ActionTypes.TOGGLE_COMPONENT_SELECTION);

export const setComponent = createAsyncAction<ActionPayloads.SetComponent>(ActionTypes.SET_COMPONENT);
export const moveComponents = createAsyncAction<ActionPayloads.MoveComponents>(ActionTypes.MOVE_COMPONENTS);
export const configureComponent = createAsyncAction<ActionPayloads.ConfigureComponent>(ActionTypes.CONFIGURE_COMPONENT);
export const renameComponent = createAsyncAction<ActionPayloads.RenameComponent>(ActionTypes.RENAME_COMPONENT); // Note: newId is new componentId only, not full id
export const clearComponents = createAsyncAction<ActionPayloads.ClearComponents>(ActionTypes.CLEAR_COMPONENTS);
export const copyComponentsToTemplate = createAsyncAction<ActionPayloads.CopyComponentsToTemplate, CopyComponentsStats>(ActionTypes.COPY_COMPONENTS_TO_TEMPLATE);
export const setTemplate = createAsyncAction<ActionPayloads.SetTemplate>(ActionTypes.SET_TEMPLATE);
export const renameTemplate = createAsyncAction<ActionPayloads.RenameTemplate>(ActionTypes.RENAME_TEMPLATE); // Note: newId is new templateId only, not full id
export const clearTemplate = createAsyncAction<ActionPayloads.ClearTemplate>(ActionTypes.CLEAR_TEMPLATE);
export const setTemplateExport = createAsyncAction<ActionPayloads.SetTemplateExport>(ActionTypes.SET_TEMPLATE_EXPORT);
export const clearTemplateExport = createAsyncAction<ActionPayloads.ClearTemplateExport>(ActionTypes.CLEAR_TEMPLATE_EXPORT);
export const setBinding = createAsyncAction<ActionPayloads.SetBinding>(ActionTypes.SET_BINDING);
export const clearBinding = createAsyncAction<ActionPayloads.ClearBinding>(ActionTypes.CLEAR_BINDING);
export const updateToolbox = createAsyncAction<ActionPayloads.UpdateToolbox>(ActionTypes.UPDATE_TOOLBOX);
