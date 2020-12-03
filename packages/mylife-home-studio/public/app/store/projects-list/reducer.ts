import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { createTable } from '../common/reducer-tools';
import { ActionTypes, ProjectsListState, CoreProjectItem, UiProjectItem, Update } from './types';

const initialState: ProjectsListState = {
  notifierId: null,
  coreProjects: createTable<CoreProjectItem>(),
  uiProjects: createTable<UiProjectItem>(),
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.coreProjects = createTable<CoreProjectItem>();
    state.uiProjects = createTable<UiProjectItem>();
  },

  [ActionTypes.PUSH_UPDATES]: (state, action: PayloadAction<Update[]>) => {
    for (const item of action.payload) {
      // TODO
    }
  },
});
