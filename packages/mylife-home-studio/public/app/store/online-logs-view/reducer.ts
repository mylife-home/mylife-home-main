import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, OnlineLogsViewState, LogItem } from './types';

const initialState: OnlineLogsViewState = {
  notifierId: null,
  items: []
};

const MAX_LOGS = 1000; // should match backend

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.items = [];
  },

  [ActionTypes.ADD_LOG_ITEMS]: (state, action: PayloadAction<LogItem[]>) => {
    for (const item of action.payload) {
      if (state.items.length === MAX_LOGS) {
        state.items.shift();
      }

      state.items.push(item);
    }
  },
});
