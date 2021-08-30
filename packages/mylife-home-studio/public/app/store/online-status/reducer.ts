import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { OnlineStatusState, ActionTypes, Status } from './types';

const DEFAULT_STATUS: Status = {
  transportConnected: null
};

const initialState: OnlineStatusState = {
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

  [ActionTypes.SET_STATUS]: (state, action: PayloadAction<Status>) => {
    state.status = action.payload;
  },
});
