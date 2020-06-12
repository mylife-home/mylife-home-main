'use strict';

import { handleActions } from 'redux-actions';
import { actionTypes } from '../constants/index';
import Immutable from 'immutable';

function createDisplay(raw) {
  if(!raw) { return null; }
  const { component_attribute, component_id, default_resource_id, map, ...others } = raw;
  return {
    component : component_id,
    attribute : component_attribute,
    resource  : `image.${default_resource_id}`,
    map       : Immutable.List(map.map(item => {
      const { resource_id, ...others } = item;
      return { resource : `image.${resource_id}`, ...others };
    })),
    ...others
  };
}

function createText(raw) {
  if(!raw) { return null; }
  const { context, format, ...others } = raw;

  const argNames = context.map(item => item.id).join(',');
  let func;
  try {
    func = new Function(argNames, format);
  } catch(err) {
    console.error(err); // eslint-disable-line no-console
    func = () => err.message;
  }

  return {
    context: Immutable.List(context.map(item => {
      const { component_id, component_attribute, ...others } = item;
      return { component : component_id, attribute : component_attribute, ...others };
    })),
    format,
    func,
    ...others
  };
}

function createAction(raw) {
  if(!raw) { return null; }
  const { component, window } = raw;
  return {
    component : component && component.component_id,
    action    : component && component.component_action,
    window    : window && window.id,
    popup     : window && window.popup
  };
}

function createControl(raw) {
  const { display, text, primary_action, secondary_action, ...others } = raw;
  return {
    display         : createDisplay(display),
    text            : createText(text),
    primaryAction   : createAction(primary_action),
    secondaryAction : createAction(secondary_action),
    ...others
  };
}

function createWindow(raw) {
  const { background_resource_id, controls, ...others } = raw;
  return {
    resource: `image.${background_resource_id}`,
    controls: Immutable.Map(controls.map(rawCtrl => { const ctrl = createControl(rawCtrl); return [ctrl.id, ctrl]; })),
    ...others
  };
}

export default handleActions({

  [actionTypes.WINDOW_NEW] : {
    next : (state, action) => {
      const window = createWindow(action.payload);
      return state.set(window.id, window);
    }
  }

}, Immutable.Map());
