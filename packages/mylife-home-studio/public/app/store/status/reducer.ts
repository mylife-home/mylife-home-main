import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, StatusState } from './types';

const initialState: StatusState = {
  online: false,
  runningRequests: 0,
  error: null,
};

export default createReducer(initialState, {
  [ActionTypes.ONLINE]: (state, action: PayloadAction<boolean>) => {
    state.online = action.payload;
  },

  [ActionTypes.BEGIN_REQUEST]: (state) => {
    ++state.runningRequests;
  },

  [ActionTypes.END_REQUEST]: (state) => {
    --state.runningRequests;
  },

  [ActionTypes.SET_ERROR]: (state, action: PayloadAction<Error>) => {
    state.error = action.payload;
  },

  [ActionTypes.CLEAR_ERROR]: (state) => {
    state.error = null;
  },
});
