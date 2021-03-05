import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, Position, UpdateProjectNotification } from './types';

export const setNotifier = createAction<{ id: string; notifierId: string; }>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<{ id: string; }>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<{ id: string; update: UpdateProjectNotification }[]>(ActionTypes.UPDATE_PROJECT);

// TODO: connect to server update
export const moveComponent = createAction<{ tabId: string; componentId: string; position: Position; }>(ActionTypes.MOVE_COMPONENT);

export const updateToolbox = createAction<{ tabId: string; itemType: 'instance' | 'plugin'; itemId: string; operation: 'show' | 'hide' | 'delete' }>(ActionTypes.UPDATE_TOOLBOX);
