import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { MODEL_SET, Window } from '../types/model';

const DEFAULT_MODEL: Window[] = [];

export default createReducer(DEFAULT_MODEL, {
  [MODEL_SET]: (state, action: PayloadAction<Window[]>) => action.payload,
});
