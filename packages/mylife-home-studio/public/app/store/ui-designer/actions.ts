import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, DefaultWindow, DefinitionResource, UpdateProjectNotification, Window } from './types';

export const setNotifier = createAction<{ id: string; notifierId: string; }>(ActionTypes.SET_NOTIFIER);
export const clearAllNotifiers = createAction(ActionTypes.CLEAR_ALL_NOTIFIERS);
export const removeOpenedProject = createAction<{ id: string; }>(ActionTypes.REMOVE_OPENED_PROJECT);
export const updateProject = createAction<{ id: string; update: UpdateProjectNotification }[]>(ActionTypes.UPDATE_PROJECT);

export const setDefaultWindow = createAction<{ id: string; defaultWindow: DefaultWindow }>(ActionTypes.SET_DEFAULT_WINDOW);
// TODO: component data
export const setResource = createAction<{ id: string; resource: DefinitionResource; }>(ActionTypes.SET_RESOURCE);
export const clearResource = createAction<{ id: string; resourceId: string; }>(ActionTypes.CLEAR_RESOURCE);
export const setWindow = createAction<{ id: string; window: Window; }>(ActionTypes.SET_WINDOW);
export const clearWindow = createAction<{ id: string; windowId: string; }>(ActionTypes.CLEAR_WINDOW);
