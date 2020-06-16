import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Map, List } from 'immutable';
import * as actionTypes from '../constants/action-types';

export interface ControlDisplayMapItem {
  readonly min: number;
  readonly max: number;
  readonly value: string;
  readonly resource: string;
}

export interface ControlDisplay {
  readonly component: string;
  readonly attribute: string;
  readonly resource: string;
  readonly map: List<ControlDisplayMapItem>;
}

export interface ControlTextContextItem {
  readonly id: string;
  readonly component: string;
  readonly attribute: string;
}

export interface ControlText {
  readonly context: List<ControlTextContextItem>;
  readonly format: string;
  readonly func: (args: string[]) => string;
}

export interface Action {
  readonly component: string;
  readonly action: string;
  readonly window: string;
  readonly popup: boolean;
}

export interface Control {
  readonly id: string;
  readonly style: string;
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly display: ControlDisplay;
  readonly primaryAction: Action;
  readonly secondaryAction: Action;
  readonly text: ControlText;
}

export interface Window {
  readonly id: string;
  readonly style: string;
  readonly height: number;
  readonly width: number;
  readonly resource: string;
  readonly controls: Map<string, Control>;
}

function createDisplay(raw: any): ControlDisplay {
  if (!raw) { return null; }
  const { component_attribute, component_id, default_resource_id, map, ...others } = raw;
  return {
    component: component_id,
    attribute: component_attribute,
    resource: `image.${default_resource_id}`,
    map: List(map.map((item: any) => {
      const { resource_id, ...others } = item;
      return { resource: `image.${resource_id}`, ...others };
    })),
    ...others
  };
}

function createText(raw: any): ControlText {
  if (!raw) { return null; }
  const { context, format, ...others } = raw;

  const argNames = context.map((item: any) => item.id).join(',');
  let func: (args: string[]) => string;
  try {
    func = new Function(argNames, format) as (args: string[]) => string;
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    func = () => err.message;
  }

  return {
    context: List(context.map((item: any) => {
      const { component_id, component_attribute, ...others } = item;
      return { component: component_id, attribute: component_attribute, ...others };
    })),
    format,
    func,
    ...others
  };
}

function createAction(raw: any): Action {
  if (!raw) { return null; }
  const { component, window } = raw;
  return {
    component: component && component.component_id,
    action: component && component.component_action,
    window: window && window.id,
    popup: window && window.popup
  };
}

function createControl(raw: any): Control {
  const { display, text, primary_action, secondary_action, ...others } = raw;
  return {
    display: createDisplay(display),
    text: createText(text),
    primaryAction: createAction(primary_action),
    secondaryAction: createAction(secondary_action),
    ...others
  };
}

function createWindow(raw: any): Window {
  const { background_resource_id, controls, ...others } = raw;
  return {
    resource: `image.${background_resource_id}`,
    controls: Map(controls.map((item: any) => { const ctrl = createControl(item); return [ctrl.id, ctrl]; })),
    ...others
  };
}

export default createReducer(Map<string, Window>(), {

  [actionTypes.WINDOW_NEW]: (state, action: PayloadAction<any>) => {
    const window = createWindow(action.payload);
    return state.set(window.id, window);
  }

});
