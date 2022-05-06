import { AppState } from '../types';

const getModel = (state: AppState) => state.model;
const getWindows = (state: AppState) => getModel(state).windows;
export const hasWindows = (state: AppState) => Object.keys(getWindows(state)).length > 0;
export const getWindow = (state: AppState, windowId: string) => getWindows(state)[windowId];
export const hasWindow = (state: AppState, windowId: string) => !!getWindow(state, windowId);
export const getWindowControl = (state: AppState, windowId: string, controlId: string) => getModel(state).controls[`${windowId}$${controlId}`];
export const getWindowTitle = (state: AppState, windowId: string) => getWindow(state, windowId).title;
export const getDefaultWindowId = (state: AppState, type: string) => getModel(state).defaultWindow[type];