import { List } from 'immutable';
import { ControlDisplayMapItem } from '../../../../shared/model';
import { AppState } from '../types';
import { RepositoryState } from '../types/registry';
import { Window, Control, ControlDisplay, ControlText, VWindow, VControl } from '../types/model';
import { getRegistry } from './registry';

export const getWindows = (state: AppState) => state.model;
export const getWindow = (state: AppState, { window }: { window: string; }) => getWindows(state).get(window);
export const getWindowControl = (state: AppState, { window, control }: { window: string; control: string; }) => getWindow(state, { window }).controls.get(control);
export const getWindowDisplay = (state: AppState, { window }: { window: string; }) => prepareWindow(getRegistry(state), getWindow(state, { window }));

function findDisplayItem(map: List<ControlDisplayMapItem>, value: any) {
  if (typeof value === 'number') {
    return map.find((item) => item.min <= value && value <= item.max) || null;
  }

  return map.find((item) => item.value === value) || null;
}

function prepareDisplay(repository: RepositoryState, display: ControlDisplay) {
  if (!display) {
    return null;
  }

  const { defaultResource } = display;

  if (!display.componentId || !display.map || !display.map.size) {
    return defaultResource;
  }
  const component = repository.get(display.componentId);
  if (!component || !component.has(display.componentState)) {
    return defaultResource;
  }
  const value = component.get(display.componentState);
  const item = findDisplayItem(display.map, value);
  if (!item) {
    return defaultResource;
  }

  return item.resource;
}

function prepareText(repository: RepositoryState, text: ControlText) {
  if (!text) {
    return null;
  }

  const args = text.context
    .map((item) => {
      const component = repository.get(item.componentId);
      return component && component.get(item.componentState);
    })
    .toArray();

  try {
    return text.func(args);
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return err.message as string;
  }
}

function prepareControl(repository: RepositoryState, window: Window, control: Control): VControl {
  const { id, width, height, display, text, primaryAction } = control;

  return {
    id,
    width,
    height,
    left: window.width * control.x - width / 2,
    top: window.height * control.y - height / 2,
    display: prepareDisplay(repository, display),
    text: prepareText(repository, text),
    active: !!primaryAction,
  };
}

function prepareWindow(repository: RepositoryState, window: Window): VWindow {
  if (!window) {
    return null;
  }
  const { controls, ...others } = window;
  return {
    controls: controls.toArray().map((ctrl) => prepareControl(repository, window, ctrl)),
    ...others,
  };
}
