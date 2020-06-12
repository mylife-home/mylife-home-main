'use strict';

import { getResources } from './resources';
import { getRepository } from './repository';

export const getWindows       = (state) => state.windows;
export const getWindow        = (state, { window }) => getWindows(state).get(window);
export const getWindowControl = (state, props) => getWindow(state, props).controls.get(props.control);
export const getWindowDisplay = (state, props) => prepareWindow(getResources(state), getRepository(state), getWindow(state, props));

function findDisplayItem(map, value) {
  if(typeof map.get(0).value === 'string') {
    for(const item of map) {
      if(item.value === value) {
        return item;
      }
    }
    return null;
  }

  value = parseInt(value);
  for(const item of map) {
    if(item.min <= value && value <= item.max) {
      return item;
    }
  }
  return null;
}

function prepareDisplay(resources, repository, display) {
  if(!display) { return null; }

  const defaultResource = resources.get(display.resource);

  if(!display.component || !display.map || !display.map.size) { return defaultResource; }
  const component = repository.get(display.component);
  if(!component || !component.has(display.attribute)) { return defaultResource; }
  const value = component.get(display.attribute);
  const item = findDisplayItem(display.map, value);
  if(!item) { return defaultResource; }

  return resources.get(item.resource);
}

function prepareText(resources, repository, text) {
  if(!text) { return null; }

  const args = text.context.map(item => {
    const component = repository.get(item.component);
    return component && component.get(item.attribute);
  }).toArray();

  try {
    return text.func.apply(null, args);
  } catch(err) {
    console.error(err); // eslint-disable-line no-console
    return err.message;
  }
}

function prepareControl(resources, repository, window, control) {
  const { id, width, height, display, text, primaryAction } = control;

  return {
    id, width, height,
    left    : (window.width * control.x) - (width / 2),
    top     : (window.height * control.y) - (height / 2),
    display : prepareDisplay(resources, repository, display),
    text    : prepareText(resources, repository, text),
    active  : !!primaryAction
  };
}

function prepareWindow(resources, repository, window) {
  const { resource, controls, ...others } = window;
  return {
    resource : resource && resources.get(resource),
    controls : controls.toArray().map(ctrl => prepareControl(resources, repository, window, ctrl)),
    ...others
  };
}

