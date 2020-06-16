import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Map, List } from 'immutable';
import { ControlDisplay, ControlText, Action, Control, Window, WINDOW_NEW } from '../types/windows';

export default createReducer(Map<string, Window>(), {
  [WINDOW_NEW]: (state, action: PayloadAction<any>) => {
    const window = createWindow(action.payload);
    return state.set(window.id, window);
  },
});

function createWindow(raw: any): Window {
  const { background_resource_id, controls, ...others } = raw;
  return {
    resource: `image.${background_resource_id}`,
    controls: Map(
      controls.map((item: any) => {
        const ctrl = createControl(item);
        return [ctrl.id, ctrl];
      })
    ),
    ...others,
  };
}

function createControl(raw: any): Control {
  const { display, text, primary_action, secondary_action, ...others } = raw;
  return {
    display: createDisplay(display),
    text: createText(text),
    primaryAction: createAction(primary_action),
    secondaryAction: createAction(secondary_action),
    ...others,
  };
}

function createDisplay(raw: any): ControlDisplay {
  if (!raw) {
    return null;
  }
  const { component_attribute, component_id, default_resource_id, map, ...others } = raw;
  return {
    component: component_id,
    attribute: component_attribute,
    resource: `image.${default_resource_id}`,
    map: List(
      map.map((item: any) => {
        const { resource_id, ...others } = item;
        return { resource: `image.${resource_id}`, ...others };
      })
    ),
    ...others,
  };
}

function createText(raw: any): ControlText {
  if (!raw) {
    return null;
  }
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
    context: List(
      context.map((item: any) => {
        const { component_id, component_attribute, ...others } = item;
        return { component: component_id, attribute: component_attribute, ...others };
      })
    ),
    format,
    func,
    ...others,
  };
}

function createAction(raw: any): Action {
  if (!raw) {
    return null;
  }
  const { component, window } = raw;
  return {
    component: component && component.component_id,
    action: component && component.component_action,
    window: window && window.id,
    popup: window && window.popup,
  };
}
