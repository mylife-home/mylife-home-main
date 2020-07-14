import { AppState } from '../types';

export const getWindows = (state: AppState) => state.model;
export const getWindow = (state: AppState, { window }: { window: string }) => getWindows(state).find((w) => w.id === window); // TODO: index
export const getWindowControl = (state: AppState, { window, control }: { window: string; control: string }) => getWindow(state, { window }).controls.find((c) => c.id === control); // TODO: index
