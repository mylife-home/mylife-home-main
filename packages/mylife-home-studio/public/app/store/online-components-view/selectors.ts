import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';
import { buildUid } from './helpers';
import { Plugin, Component } from './types';

export interface InstanceName {
  instanceName: string;
  pluginsIds: string[];
  componentsIds: string[];
}

export interface InstanceAndId {
  instanceName: string;
  id: string;
}

export interface PluginData extends Plugin {
  componentsIds: string[];
}

export interface ComponentData extends Component {
  pluginsIds: string[];
}

export const hasOnlineComponentsViewTab = (state: AppState) => getTabsCount(state, TabType.ONLINE_COMPONENTS_VIEW) > 0;

const getOnlineComponentsView = (state: AppState) => state.onlineComponentsView;
export const getNotifierId = (state: AppState) => getOnlineComponentsView(state).notifierId;
/*
export const getPlugin = (state: AppState, instanceName: string, pluginId: string) => {
  const plugin: PluginData = {
    ...getOnlineComponentsView(state).plugins[buildUid(instanceName, pluginId)],
    componentsIds: []
  };
  // TODO
  return plugin;
}

export const getComponent = (state: AppState, instanceName: string, componentId: string) => {
  const component: ComponentData = {
    ...getOnlineComponentsView(state).components[buildUid(instanceName, componentId)],
    pluginsIds: []
  };
  // TODO
  return component;
}

export const getInstancesNames = createSelector(
  (state: AppState) => getOnlineComponentsView(state).plugins,
  (state: AppState) => getOnlineComponentsView(state).components,
  (plugins, components) => {
    const set = new Set<string>();
    for (const plugin of Object.values(plugins)) {
      set.add(plugin.instanceName);
    }

    const instancesNames = Array.from(set).sort().map(instanceName => ({
      instanceName,
      pluginsIds: [],
      componentsIds: []
    } as InstanceName));

    const map = new Map<string, InstanceName>();
    for (const item of instancesNames) {
      map.set(item.instanceName, item);
    }

    for(const plugin of Object.values(plugins)) {
      const instanceName = map.get(plugin.instanceName);
      instanceName.pluginsIds.push(plugin.id);
    }

    for(const component of Object.values(components)) {
      const instanceName = map.get(component.instanceName);
      instanceName.componentsIds.push(component.id);
    }

    return instancesNames;
  }
);

export const getPluginsIds = createSelector(
  (state: AppState) => getOnlineComponentsView(state).plugins,
  (plugins) => Object.values(plugins).map(mapId).sort(comparer)
);

export const getComponentsIds = createSelector(
  (state: AppState) => getOnlineComponentsView(state).components,
  (components) => Object.values(components).map(mapId).sort(comparer)
);

function mapId<T extends InstanceAndId>(obj: T) {
  const { instanceName, id } = obj;
  return { instanceName, id };
}

function comparer(a: InstanceAndId, b: InstanceAndId) {
  if (a.instanceName < b.instanceName) {
    return -1;
  }
  if (a.instanceName > b.instanceName) {
    return 1;
  }

  return a.id < b.id ? -1 : 1;
}
*/