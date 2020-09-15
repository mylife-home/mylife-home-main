import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, OnlineLogsViewState, LogRecord } from './types';

const initialState: OnlineLogsViewState = {
  notifierId: null,
  records: []
};

const MAX_LOGS = 1000; // should match backend

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.records = [];
  },

  [ActionTypes.ADD_RECORD]: (state, action: PayloadAction<LogRecord>) => {
    if(state.records.length === MAX_LOGS) {
      state.records.shift();
    }

    state.records.push(action.payload);
  },
});
