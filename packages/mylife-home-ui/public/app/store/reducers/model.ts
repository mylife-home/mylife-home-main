import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { MODEL_SET, Window } from '../types/model';

const DEFAULT: Window[] = [];

export default createReducer(DEFAULT, {
  [MODEL_SET]: (state, action: PayloadAction<Window[]>) => action.payload,
});
