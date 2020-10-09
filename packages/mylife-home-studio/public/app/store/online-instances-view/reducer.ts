import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, OnlineInstancesViewState, InstanceInfo } from './types';

const initialState: OnlineInstancesViewState = {
  notifierId: null,
  instances: {}
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.instances = {};
  },

  [ActionTypes.SET_INSTANCE]: (state, action: PayloadAction<{ instanceName: string, data: InstanceInfo; }>) => {
    const { instanceName, data } = action.payload;
    state.instances[instanceName] = data;
  },

  [ActionTypes.CLEAR_INSTANCE]: (state, action: PayloadAction<{ instanceName: string; }>) => {
    const { instanceName } = action.payload;
    delete state.instances[instanceName];
  },
});
