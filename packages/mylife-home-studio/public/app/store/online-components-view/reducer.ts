import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { buildUid } from './helpers';
import { ActionTypes, OnlineComponentsViewState, Plugin, Component, State } from './types';

const initialState: OnlineComponentsViewState = {
  notifierId: null,
  plugins: {},
  components: {},
  states: {},
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.plugins = {};
    state.components = {};
    state.states = {};
  },

  [ActionTypes.SET_PLUGIN]: (state, action: PayloadAction<{ plugin: Plugin; }>) => {
    const { plugin } = action.payload;
    const uid = buildUid(plugin.instanceName, plugin.id);
    state.plugins[uid] = plugin;
  },

  [ActionTypes.CLEAR_PLUGIN]: (state, action: PayloadAction<{ instanceName: string; id: string; }>) => {
    const { instanceName, id } = action.payload;
    const uid = buildUid(instanceName, id);
    delete state.plugins[uid];
  },

  [ActionTypes.SET_COMPONENT]: (state, action: PayloadAction<{ component: Component; }>) => {
    const { component } = action.payload;
    const uid = buildUid(component.instanceName, component.id);
    state.components[uid] = component;
  },

  [ActionTypes.CLEAR_COMPONENT]: (state, action: PayloadAction<{ instanceName: string; id: string; }>) => {
    const { instanceName, id } = action.payload;
    const uid = buildUid(instanceName, id);
    delete state.components[uid];

    // delete all related states
    for (const [uid, item] of Object.entries(state.states)) {
      if (item.instanceName === instanceName && item.component === id) {
        delete state.states[uid];
      }
    }
  },

  [ActionTypes.SET_STATE]: (state, action: PayloadAction<{ state: State; }>) => {
    const { state: compState } = action.payload;
    const uid = buildUid(compState.instanceName, compState.component, compState.name);
    state.states[uid] = compState;
  },
});
