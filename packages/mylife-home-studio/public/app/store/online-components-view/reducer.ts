import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { arrayAdd, arrayRemove, createTable, tableAdd, tableRemove } from '../common/reducer-tools';
import { MemberType } from '../core-designer/types';
import { ActionTypes, OnlineComponentsViewState, Plugin, Component, State, NetPlugin, NetComponent, Instance, Update, SetPluginUpdate, ClearPluginUpdate, ClearComponentUpdate, SetComponentUpdate, SetStateUpdate } from './types';

const initialState: OnlineComponentsViewState = {
  notifierId: null,
  instances: createTable<Instance>(),
  plugins: createTable<Plugin>(),
  components: createTable<Component>(),
  states: createTable<State>(),
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.instances = createTable<Instance>();
    state.plugins = createTable<Plugin>();
    state.components = createTable<Component>();
    state.states = createTable<State>();
  },

  [ActionTypes.PUSH_UPDATES]: (state, action: PayloadAction<Update[]>) => {
    for (const update of action.payload) {
      switch (update.type) {
        case 'set-plugin':
          setPlugin(state, update as SetPluginUpdate);
          break;
        case 'clear-plugin':
          clearPlugin(state, update as ClearPluginUpdate);
          break;
        case 'set-component':
          setComponent(state, update as SetComponentUpdate);
          break;
        case 'clear-component':
          clearComponent(state, update as ClearComponentUpdate);
          break;
        case 'set-state':
          setState(state, update as SetStateUpdate);
          break;
      }
    }
  },
});

function setPlugin(state: OnlineComponentsViewState, update: SetPluginUpdate) {
  const { instanceName, plugin } = update;
  const instance = ensureInstance(state, instanceName);
  const display = `${plugin.module}.${plugin.name}`;
  const id = `${instanceName}:${plugin.module}.${plugin.name}`;
  const stateIds: string[] = Object.entries(plugin.members).filter(([name, item]) => item.memberType === MemberType.STATE).map(([name]) => name);
  const actionIds: string[] = Object.entries(plugin.members).filter(([name, item]) => item.memberType === MemberType.ACTION).map(([name]) => name);
  const configIds: string[] = Object.keys(plugin.config).sort();

  tableAdd(state.plugins, { ...plugin, id, display, instance: instanceName, stateIds, actionIds, configIds, components: [] }, true);
  arrayAdd(instance.plugins, id, true);
}

function clearPlugin(state: OnlineComponentsViewState, update: ClearPluginUpdate) {
  const { instanceName, id: pluginId } = update;
  const id = `${instanceName}:${pluginId}`;

  const plugin = state.plugins.byId[id];
  if (plugin.components.length > 0) {
    throw new Error(`Cannot remove plugin with components: '${id}'`);
  }

  tableRemove(state.plugins, id);

  const instance = state.instances.byId[instanceName];
  arrayRemove(instance.plugins, id);

  clearInstanceIfEmpty(state, instanceName);
}

function setComponent(state: OnlineComponentsViewState, update: SetComponentUpdate) {
  const { instanceName, component } = update;
  const pluginId = `${instanceName}:${component.plugin}`;
  const plugin = state.plugins.byId[pluginId];
  if (!plugin) {
    throw new Error(`Cannot create component '${component.id}' on '${instanceName}' with non-existant plugin '${component.plugin}'`);
  }

  const instance = state.instances.byId[instanceName];
  const id = `${instanceName}:${component.id}`;
  tableAdd(state.components, { id, display: component.id, instance: instanceName, plugin: pluginId, states: [] } as Component, true);
  arrayAdd(plugin.components, id, true);
  arrayAdd(instance.components, id, true);
}

function clearComponent(state: OnlineComponentsViewState, update: ClearComponentUpdate) {
  const { instanceName, id: componentId } = update;
  const id = `${instanceName}:${componentId}`;
  const component = state.components.byId[id];
  const plugin = state.plugins.byId[component.plugin];
  const instance = state.instances.byId[component.instance];

  tableRemove(state.components, id);
  arrayRemove(plugin.components, id);
  arrayRemove(instance.components, id);
  for (const stateId of component.states) {
    tableRemove(state.states, stateId);
  }
}

function setState(state: OnlineComponentsViewState, update: SetStateUpdate) {
  const { instanceName, component: componentId, name, value } = update;

  const id = `${instanceName}:${componentId}:${name}`;
  const component = state.components.byId[`${instanceName}:${componentId}`];

  const existing = state.states.byId[id];
  if (existing) {
    existing.value = value;
    return;
  }

  arrayAdd(component.states, id, true);
  tableAdd(state.states, { id, instance: instanceName, component: component.id, name, value }, true);
}

function ensureInstance(state: OnlineComponentsViewState, instanceName: string): Instance {
  const existing = state.instances.byId[instanceName];
  if (existing) {
    return existing;
  }

  const newInstance: Instance = { id: instanceName, display: instanceName, plugins: [], components: [] };
  tableAdd(state.instances, newInstance, true);
  return newInstance;
}

function clearInstanceIfEmpty(state: OnlineComponentsViewState, instanceName: string) {
  const instance = state.instances.byId[instanceName];
  if (instance.plugins.length === 0) {
    tableRemove(state.instances, instanceName);
  }
}