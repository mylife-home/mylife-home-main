import { AppState } from '../types';
import { VWindow, VControl, Window, Control, ControlText, ControlDisplay, ControlDisplayMapItem } from '../types/model';
import { getComponentState } from './registry';

export const getWindows = (state: AppState) => state.model;
export const getWindow = (state: AppState, { window }: { window: string }) => getWindows(state).find((w) => w.id === window); // TODO: index
export const getWindowControl = (state: AppState, { window, control }: { window: string; control: string }) => getWindow(state, { window }).controls.find((c) => c.id === control); // TODO: index
export const getWindowDisplay = (state: AppState, { window }: { window: string }) => prepareWindow(state, getWindow(state, { window }));

function findDisplayItem(map: ControlDisplayMapItem[], value: any) {
  if (typeof value === 'number') {
    return map.find((item) => item.min <= value && value <= item.max) || null;
  }

  return map.find((item) => item.value === value) || null;
}

function prepareDisplay(state: AppState, display: ControlDisplay) {
  if (!display) {
    return null;
  }

  const { defaultResource } = display;

  const value = getComponentState(state, display.componentId, display.componentState);
  if (value === undefined) {
    return defaultResource;
  }
  const item = findDisplayItem(display.map, value);
  if (!item) {
    return defaultResource;
  }

  return item.resource;
}

function prepareText(state: AppState, text: ControlText) {
  if (!text) {
    return null;
  }

  const args = text.context.map((item) => getComponentState(state, item.componentId, item.componentState));

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

function prepareControl(state: AppState, window: Window, control: Control): VControl {
  const { id, width, height, display, text, primaryAction } = control;

  return {
    id,
    width,
    height,
    left: window.width * control.x - width / 2,
    top: window.height * control.y - height / 2,
    display: prepareDisplay(state, display),
    text: prepareText(state, text),
    active: !!primaryAction,
  };
}

function prepareWindow(state: AppState, window: Window): VWindow {
  if (!window) {
    return null;
  }
  const { controls, ...others } = window;
  return {
    controls: controls.map((ctrl) => prepareControl(state, window, ctrl)),
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
