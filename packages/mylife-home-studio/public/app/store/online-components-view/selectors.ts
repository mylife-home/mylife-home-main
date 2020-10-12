import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';
import { buildUid } from './helpers';

export const hasOnlineComponentsViewTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_COMPONENTS_VIEW) > 0;

const getOnlineComponentsView = (state: AppState) => state.onlineComponentsView;
export const getNotifierId = (state: AppState) => getOnlineComponentsView(state).notifierId;

export const getPlugin = (state: AppState, instanceName: string, pluginId: string) => getOnlineComponentsView(state).plugins[buildUid(instanceName, pluginId)];
export const getComponent = (state: AppState, instanceName: string, componentId: string) => getOnlineComponentsView(state).components[buildUid(instanceName, componentId)];

export const getInstanceNames = createSelector(
  (state: AppState) => getOnlineComponentsView(state).plugins,
  (plugins) => {
    const set = new Set<string>();
    for (const plugin of Object.values(plugins)) {
      set.add(plugin.instanceName);
    }
    return Array.from(set);
  }
);

export const getPlugins = createSelector(
  (state: AppState) => getOnlineComponentsView(state).plugins,
  (plugins) => Object.values(plugins).sort(comparer)
);

export const getComponents = createSelector(
  (state: AppState) => getOnlineComponentsView(state).components,
  (components) => Object.values(components).sort(comparer)
);

interface InstanceAndId {
  instanceName: string;
  id: string;
}

function comparer<T extends InstanceAndId>(a: T, b: T) {
  if (a.instanceName < b.instanceName) {
    return -1;
  }
  if (a.instanceName > b.instanceName) {
    return 1;
  }

  return a.id < b.id ? -1 : 1;
}