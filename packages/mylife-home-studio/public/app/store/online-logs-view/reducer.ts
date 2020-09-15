import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, OnlineLogsViewState, LogRecord } from './types';

const initialState: OnlineLogsViewState = {
  notificationId: null,
  records: []
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notificationId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notificationId = null;
    state.records = [];
  },

  [ActionTypes.ADD_RECORD]: (state, action: PayloadAction<LogRecord>) => {
    state.records.push(action.payload);
  },
});
