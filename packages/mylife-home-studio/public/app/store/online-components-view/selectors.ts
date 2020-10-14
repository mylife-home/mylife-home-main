import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';
import { Plugin, Component } from './types';

export const hasOnlineComponentsViewTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_COMPONENTS_VIEW) > 0;

const getOnlineComponentsView = (state: AppState) => state.onlineComponentsView;
export const getNotifierId = (state: AppState) => getOnlineComponentsView(state).notifierId;

export const getInstancesIds = (state: AppState) => getOnlineComponentsView(state).instances.allIds;
export const getInstance = (state: AppState, id: string) => getOnlineComponentsView(state).instances.byId[id];
export const getPluginsIds = (state: AppState) => getOnlineComponentsView(state).plugins.allIds;
export const getPlugin = (state: AppState, id: string) => getOnlineComponentsView(state).plugins.byId[id];
export const getComponentsIds = (state: AppState) => getOnlineComponentsView(state).components.allIds;
export const getComponent = (state: AppState, id: string) => getOnlineComponentsView(state).components.byId[id];
export const getState = (state: AppState, id: string) => getOnlineComponentsView(state).states.byId[id];
