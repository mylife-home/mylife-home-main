import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable } from '../common/reducer-tools';
import { Table } from '../common/types';
import { ActionTypes, DeployState, Update } from './types';

const initialState: DeployState = {
  notifierId: null,
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    //state.items = createTable<HistoryItem>();
  },

  [ActionTypes.PUSH_UPDATES]: (state, action: PayloadAction<Update[]>) => {
    for (const item of action.payload) {
      // TODO
    }
  },
});
