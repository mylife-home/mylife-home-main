import { createSelector } from 'reselect';
import { AppState } from '../types';
import { Window, Control } from '../types/model';

const getWindows = (state: AppState) => state.model;
export const getWindow = (state: AppState, windowId: string) => getWindowById(state)(windowId);
export const getWindowControl = (state: AppState, windowId: string, controlId: string) => getWindowControlById(state)(windowId, controlId);

const getWindowById = createSelector(getWindows, (windows) => {
  const windowsById: { [id: string]: Window } = {};
  for (const window of windows) {
    windowsById[window.id] = window;
  }

  return (windowId: string) => windowsById[windowId];
});

const getWindowControlById = createSelector(getWindows, (windows) => {
  const createKey = (windowId: string, controlId: string) => windowId + '$' + controlId;
  const controlsById: { [id: string]: Control } = {};

  for (const window of windows) {
    for (const control of window.controls) {
      const id = createKey(window.id, control.id);
      controlsById[id] = control;
    }
  }

  return (windowId: string, controlId: string) => {
    const id = createKey(windowId, controlId);
    return controlsById[id];
  };
});
