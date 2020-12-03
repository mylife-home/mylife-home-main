import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, ProjectsListState, Update } from './types';

const initialState: ProjectsListState = {
  notifierId: null,
  //items: []
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    //state.items = [];
  },

  [ActionTypes.PUSH_UPDATES]: (state, action: PayloadAction<Update[]>) => {
    for (const item of action.payload) {
      // TODO
    }
  },
});
