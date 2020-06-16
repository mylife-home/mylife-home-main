import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { List } from 'immutable';
import { VIEW_POPUP, VIEW_CLOSE, VIEW_CHANGE } from '../types/view';

export default createReducer(List<string>(), {
  [VIEW_POPUP]: (state, action: PayloadAction<string>) => state.push(action.payload),
  [VIEW_CLOSE]: (state, action) => state.pop(),
  [VIEW_CHANGE]: (state, action: PayloadAction<string>) => state.clear().push(action.payload),
});
