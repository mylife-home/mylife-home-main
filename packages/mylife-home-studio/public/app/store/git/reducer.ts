import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { GitState, ActionTypes, GitStatus, DEFAULT_STATUS } from './types';

const initialState: GitState = {
  notifierId: null,
  status: DEFAULT_STATUS
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.status = DEFAULT_STATUS;
  },

  [ActionTypes.SET_STATUS]: (state, action: PayloadAction<GitStatus>) => {
    state.status = action.payload;
  },
});
