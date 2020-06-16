import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { List } from 'immutable';
import * as actionTypes from '../constants/action-types';

export default createReducer(List<string>(), {
  [actionTypes.VIEW_POPUP]: (state, action: PayloadAction<string>) => state.push(action.payload),
  [actionTypes.VIEW_CLOSE]: (state, action) => state.pop(),
  [actionTypes.VIEW_CHANGE]: (state, action: PayloadAction<string>) => state.clear().push(action.payload),
});
