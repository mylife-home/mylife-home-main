import { createReducer } from '@reduxjs/toolkit';
import { ONLINE_SET } from '../types/online';

export default createReducer(false, {
  [ONLINE_SET]: (state, action) => action.payload,
});
