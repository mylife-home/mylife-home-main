import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, OnlineHistoryState, HistoryItem } from './types';

const initialState: OnlineHistoryState = {
  notifierId: null,
  items: []
};

const MAX_ITEMS = 1000; // should match backend

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.items = [];
  },

  [ActionTypes.ADD_HISTORY_ITEMS]: (state, action: PayloadAction<HistoryItem[]>) => {
    for (const item of action.payload) {
      if (state.items.length === MAX_ITEMS) {
        state.items.shift();
      }

      state.items.push(item);
    }
  },
});
