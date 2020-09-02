import { AppState } from '../types';

const getCoreDesigner = (state: AppState, tabId: string) => state.coreDesigner[tabId];
export const getPluginIds = (state: AppState, tabId: string) => getCoreDesigner(state, tabId).plugins.allIds;
export const getPlugin = (state: AppState, tabId: string, pluginId: string) => getCoreDesigner(state, tabId).plugins.byId[pluginId];
export const getComponentIds = (state: AppState, tabId: string) => getCoreDesigner(state, tabId).components.allIds;
export const getComponent = (state: AppState, tabId: string, componentId: string) => getCoreDesigner(state, tabId).components.byId[componentId];
export const getBindingIds = (state: AppState, tabId: string) => getCoreDesigner(state, tabId).bindings.allIds;
export const getBinding = (state: AppState, tabId: string, bindingId: string) => getCoreDesigner(state, tabId).bindings.byId[bindingId];
