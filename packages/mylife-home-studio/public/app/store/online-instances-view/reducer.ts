import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, OnlineInstancesViewState, Update, SetUpdate, ClearUpdate } from './types';

const initialState: OnlineInstancesViewState = {
  notifierId: null,
  instances: {}
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.instances = {};
  },

  [ActionTypes.PUSH_UPDATES]: (state, action: PayloadAction<Update[]>) => {
    for (const update of action.payload) {
      switch (update.type) {
        case 'set': {
          const { instanceName, data } = update as SetUpdate;
          state.instances[instanceName] = data;
          break;
        }

        case 'clear': {
          const { instanceName } = update as ClearUpdate;
          delete state.instances[instanceName];
          break;
        }
      }
    }
  },
});
