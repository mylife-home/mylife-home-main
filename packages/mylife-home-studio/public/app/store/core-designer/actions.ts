import { createAction } from '@reduxjs/toolkit';
import { createAsyncAction } from '../common/async-action';
import { ActionTypes, Position, UpdateProjectNotification, CoreBindingData } from './types';

export const setNotifier = createAction<{ id: string; notifierId: string; }>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<{ id: string; }>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<{ id: string; update: UpdateProjectNotification }[]>(ActionTypes.UPDATE_PROJECT);

// TODO: connect to server update
export const moveComponent = createAction<{ id: string; componentId: string; position: Position; }>(ActionTypes.MOVE_COMPONENT);

export const renameComponent = createAsyncAction<{ id: string; componentId: string; newId: string }>(ActionTypes.RENAME_COMPONENT);
export const clearComponent = createAsyncAction<{ id: string; componentId: string; }>(ActionTypes.CLEAR_COMPONENT);
export const setBinding = createAsyncAction<{ id: string; binding: CoreBindingData; }>(ActionTypes.SET_BINDING);
export const clearBinding = createAsyncAction<{ id: string; bindingId: string; }>(ActionTypes.CLEAR_BINDING);
export const updateToolbox = createAsyncAction<{ id: string; itemType: 'instance' | 'plugin'; itemId: string; action: 'show' | 'hide' | 'delete' }>(ActionTypes.UPDATE_TOOLBOX);
