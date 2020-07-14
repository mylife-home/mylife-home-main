import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { VIEW_POPUP, VIEW_CLOSE, VIEW_CHANGE } from '../types/view';

const DEFAULT: string[] = [];

export default createReducer(DEFAULT, {
  [VIEW_POPUP]: (state, action: PayloadAction<string>) => [...state, action.payload],
  [VIEW_CLOSE]: (state, action) => pop(state),
  [VIEW_CHANGE]: (state, action: PayloadAction<string>) => [action.payload],
});

function pop<T>(array: T[]): T[] {
  return [...array.slice(0, array.length - 1)];
}
