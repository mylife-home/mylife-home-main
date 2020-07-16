import { AppState } from '../types';
import { getComponentState } from './registry';
import { Window, Control, ControlDisplayMapItem, ControlText, ControlDisplay } from '../types/model';
import { getWindowControl, getWindow } from './model';

export interface UIControl {
  readonly id: string;
  readonly height: number;
  readonly width: number;
  readonly left: number;
  readonly top: number;
  readonly displayResource: string;
  readonly text: string;
  readonly active: boolean;
}

export const getUIControl = (state: AppState, windowId: string, controlId: string): UIControl => {
  const window = getWindow(state, windowId);
  const control = getWindowControl(state, windowId, controlId);
  return prepareControl(state, window, control);
}

function prepareControl(state: AppState, window: Window, control: Control): UIControl {
  const { id, width, height, display, text, primaryAction } = control;

  return {
    id,
    width,
    height,
    left: window.width * control.x - width / 2,
    top: window.height * control.y - height / 2,
    displayResource: prepareDisplay(state, display),
    text: prepareText(state, text),
    active: !!primaryAction,
  };
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

function findDisplayItem(map: ControlDisplayMapItem[], value: any) {
  if (typeof value === 'number') {
    return map.find((item) => item.min <= value && value <= item.max) || null;
  }

  return map.find((item) => item.value === value) || null;
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
