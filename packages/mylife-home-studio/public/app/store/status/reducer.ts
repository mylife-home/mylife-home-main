import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes, StatusState } from './types';

const initialState: StatusState = {
  online: false
};

export default createReducer(initialState, {
  [ActionTypes.ONLINE]: (state, action: PayloadAction<boolean>) => {
    state.online = action.payload;
  },
});
