import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable, tableAdd, tableRemove } from '../common/reducer-tools';
import { ActionTypes, StatusState, RunningRequest } from './types';

const initialState: StatusState = {
  online: false,
  runningRequests: createTable<RunningRequest>(),
  error: null,
};

export default createReducer(initialState, {
  [ActionTypes.ONLINE]: (state, action: PayloadAction<boolean>) => {
    state.online = action.payload;
  },

  [ActionTypes.BEGIN_REQUEST]: (state, action: PayloadAction<{ id: string; service: string; }>) => {
    const { id, service } = action.payload;
    const begin = new Date();
    tableAdd(state.runningRequests, { id, service, begin }, true);
  },

  [ActionTypes.END_REQUEST]: (state, action: PayloadAction<string>) => {
    tableRemove(state.runningRequests, action.payload);
  },

  [ActionTypes.SET_ERROR]: (state, action: PayloadAction<Error>) => {
    state.error = action.payload;
  },

  [ActionTypes.CLEAR_ERROR]: (state) => {
    state.error = null;
  },
});
