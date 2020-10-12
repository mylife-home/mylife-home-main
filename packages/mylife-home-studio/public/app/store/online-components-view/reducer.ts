import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, OnlineComponentsViewState, Plugin, Component } from './types';

const initialState: OnlineComponentsViewState = {
  notifierId: null,
  // instances: {}
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
//    state.instances = {};
  },

  [ActionTypes.SET_PLUGIN]: (state, action: PayloadAction<{ instanceName: string, plugin: Plugin; }>) => {
  },

  [ActionTypes.CLEAR_PLUGIN]: (state, action: PayloadAction<{ instanceName: string; id: string; }>) => {
  },

  [ActionTypes.SET_COMPONENT]: (state, action: PayloadAction<{ instanceName: string, component: Component; }>) => {
  },

  [ActionTypes.CLEAR_COMPONENT]: (state, action: PayloadAction<{ instanceName: string; id: string; }>) => {
  },

  [ActionTypes.SET_STATE]: (state, action: PayloadAction<{ instanceName: string; component: string; name: string, value: any }>) => {
  },
});
