import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Map, List } from 'immutable';
import { ControlDisplay, ControlText, Action, Control, Window, WINDOW_NEW, WINDOW_CLEAR, WindowRaw, ControlRaw, ControlDisplayRaw, ControlTextRaw, ActionRaw } from '../types/model';

export default createReducer(Map<string, Window>(), {
  [WINDOW_NEW]: (state, action: PayloadAction<any>) => {
    const window = createWindow(action.payload);
    return state.set(window.id, window);
  },

  [WINDOW_CLEAR]: (state, action) => state.clear(),
});

function createWindow(raw: WindowRaw): Window {
  const { background_resource_id, controls, ...others } = raw;
  return {
    resource: background_resource_id,
    controls: Map(
      controls.map((item) => {
        const ctrl = createControl(item);
        return [ctrl.id, ctrl];
      })
    ),
    ...others,
  };
}

function createControl(raw: ControlRaw): Control {
  const { display, text, primary_action, secondary_action, ...others } = raw;
  return {
    display: createDisplay(display),
    text: createText(text),
    primaryAction: createAction(primary_action),
    secondaryAction: createAction(secondary_action),
    ...others,
  };
}

function createDisplay(raw: ControlDisplayRaw): ControlDisplay {
  if (!raw) {
    return null;
  }
  const { component_attribute, component_id, default_resource_id, map, ...others } = raw;
  return {
    component: component_id,
    attribute: component_attribute,
    resource: default_resource_id,
    map: List(
      map.map((item) => {
        const { resource_id, ...others } = item;
        return { resource: resource_id, ...others };
      })
    ),
    ...others,
  };
}

function createText(raw: ControlTextRaw): ControlText {
  if (!raw) {
    return null;
  }
  const { context, format, ...others } = raw;

  const argNames = context.map((item) => item.id).join(',');
  let func: (args: string[]) => string;
  try {
    func = new Function(argNames, format) as (args: string[]) => string;
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    func = () => err.message;
  }

  return {
    context: List(
      context.map((item) => {
        const { component_id, component_attribute, ...others } = item;
        return { component: component_id, attribute: component_attribute, ...others };
      })
    ),
    format,
    func,
    ...others,
  };
}

function createAction(raw: ActionRaw): Action {
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
