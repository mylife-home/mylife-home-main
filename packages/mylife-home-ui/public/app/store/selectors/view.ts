import { AppState } from '../types';

export const getView = (state: AppState) => state.view;
export const hasView = (state: AppState) => !!getView(state)[0];
export const isViewPopup = (state: AppState) => getView(state).length > 1;
