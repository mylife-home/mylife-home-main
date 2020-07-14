import { AppState } from '../types';
import { RepositoryState } from '../types/registry';
import { VWindow, VControl, Window, Control, ControlText, ControlDisplay, ControlDisplayMapItem } from '../types/model';
import { getRegistry } from './registry';

export const getWindows = (state: AppState) => state.model;
export const getWindow = (state: AppState, { window }: { window: string; }) => getWindows(state).find(w => w.id === window); // TODO: index
export const getWindowControl = (state: AppState, { window, control }: { window: string; control: string; }) => getWindow(state, { window }).controls.find(c => c.id === control); // TODO: index
export const getWindowDisplay = (state: AppState, { window }: { window: string; }) => prepareWindow(getRegistry(state), getWindow(state, { window }));

function findDisplayItem(map: ControlDisplayMapItem[], value: any) {
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

  if (!display.componentId || !display.map || !display.map.length) {
    return defaultResource;
  }
  const component = repository[display.componentId];
  if (!component || !component.hasOwnProperty(display.componentState)) {
    return defaultResource;
  }
  const value = component[display.componentState];
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
      const component = repository[item.componentId];
      return component && component[item.componentState];
    });

  // TODO: cache function
  const argNames = text.context.map((item) => item.id).join(',');
  let func: (args: string[]) => string;
  try {
    func = new Function(argNames, text.format) as (args: string[]) => string;
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    func = () => err.message;
  }
  // ---
  
  try {
    return func(args);
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
    controls: controls.map((ctrl) => prepareControl(repository, window, ctrl)),
    ...others,
  };
}

// TODO: use it!
interface TypeWithId {
  readonly id: string;
}

function indexById<T extends TypeWithId>(list: T[]): { [id: string]: T } {
  const result: { [id: string]: T } = {};
  for (const item of list) {
    result[item.id] = item;
  }
  return result;
}
