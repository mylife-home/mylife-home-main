import { createReducer, PayloadAction } from '@reduxjs/toolkit';
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
  },

  [ActionTypes.CLEAR_PLUGIN]: (state, action: PayloadAction<{ instanceName: string; id: string; }>) => {
  },

  [ActionTypes.SET_COMPONENT]: (state, action: PayloadAction<{ component: Component; }>) => {
  },

  [ActionTypes.CLEAR_COMPONENT]: (state, action: PayloadAction<{ instanceName: string; id: string; }>) => {
  },

  [ActionTypes.SET_STATE]: (state, action: PayloadAction<{ state: State }>) => {
  },
});
