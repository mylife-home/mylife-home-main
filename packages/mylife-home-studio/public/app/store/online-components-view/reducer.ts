import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable, ItemWithId } from '../common/reducer-tools';
import { Table } from '../common/types';
import { ActionTypes, OnlineComponentsViewState, Plugin, Component, State, NetPlugin, NetComponent, Instance } from './types';

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

  [ActionTypes.SET_PLUGIN]: (state, action: PayloadAction<{ instanceName: string; plugin: NetPlugin; }>) => {
    const { instanceName, plugin } = action.payload;
    const instance = ensureInstance(state, instanceName);
    const id = `${instanceName}:${plugin.module}.${plugin.name}`;

    tableAdd(state.plugins, { ...plugin, id, instanceName, components: [] });
    arrayAdd(instance.plugins, id);
  },

  [ActionTypes.CLEAR_PLUGIN]: (state, action: PayloadAction<{ instanceName: string; id: string; }>) => {
    const { instanceName, id: pluginId } = action.payload;
    const id = `${instanceName}:${pluginId}`;

    const plugin = state.plugins.byId[id];
    if (plugin.components.length > 0) {
      throw new Error(`Cannot remove plugin with components: '${id}'`);
    }

    tableRemove(state.plugins, id);

    const instance = state.instances.byId[instanceName];
    arrayRemove(instance.plugins, id);

    clearInstanceIfEmpty(state, instanceName);
  },

  [ActionTypes.SET_COMPONENT]: (state, action: PayloadAction<{ instanceName: string; component: NetComponent; }>) => {
    const { instanceName, component } = action.payload;
    const pluginId = `${instanceName}:${component.plugin}`;
    const plugin = state.plugins.byId[pluginId];
    if (!plugin) {
      throw new Error(`Cannot create component '${component.id}' on '${instanceName}' with non-existant plugin '${component.plugin}'`);
    }

    const instance = state.instances.byId[instanceName];
    const id = `${instanceName}:${component.id}`;
    tableAdd(state.components, { id, plugin: pluginId, states: [] } as Component);
    arrayAdd(plugin.components, id);
    arrayAdd(instance.components, id);
  },

  [ActionTypes.CLEAR_COMPONENT]: (state, action: PayloadAction<{ instanceName: string; id: string; }>) => {
    const { instanceName, id: componentId } = action.payload;
    const id = `${instanceName}:${componentId}`;
    const component = state.components.byId[id];
    const plugin = state.plugins.byId[component.plugin];
    const instance = state.instances.byId[component.instanceName];

    tableRemove(state.components, id);
    arrayRemove(plugin.components, id);
    arrayRemove(instance.components, id);
    for (const stateId of component.states) {
      tableRemove(state.states, stateId);
    }
  },

  [ActionTypes.SET_STATE]: (state, action: PayloadAction<{ instanceName: string; component: string; name: string; value: any; }>) => {
    const { instanceName, component: componentId, name, value } = action.payload;

    const id = `${instanceName}:${componentId}:${name}`;
    const component = state.components.byId[`${instanceName}:${componentId}`];

    const existing = state.states.byId[id];
    if (existing) {
      existing.value = value;
      return;
    }

    arrayAdd(component.states, id);
    tableAdd(state.states, { id, instanceName, component: componentId, name, value });
  },
});

function tableAdd<T extends ItemWithId>(table: Table<T>, item: T) {
  const { id } = item;
  if (table.byId[id]) {
    return;
  }

  table.byId[id] = item;
  arrayAdd(table.allIds, id);
}

function tableRemove<T extends ItemWithId>(table: Table<T>, id: string) {
  if (!table.byId[id]) {
    return;
  }

  delete table.byId[id];
  arrayRemove(table.allIds, id);
}

function arrayAdd(array: string[], id: string) {
  array.push(id);
  array.sort(); // sort by id
}

function arrayRemove(array: string[], id: string) {
  // could use binary search ?
  const index = array.indexOf(id);
  array.splice(index, 1);
}

function ensureInstance(state: OnlineComponentsViewState, instanceName: string): Instance {
  const existing = state.instances.byId[instanceName];
  if (existing) {
    return existing;
  }

  const newInstance: Instance = { id: instanceName, instanceName, plugins: [], components: [] };
  tableAdd(state.instances, newInstance);
  return newInstance;
}

function clearInstanceIfEmpty(state: OnlineComponentsViewState, instanceName: string) {
  const instance = state.instances.byId[instanceName];
  if (instance.plugins.length === 0) {
    tableRemove(state.instances, instanceName);
  }
}