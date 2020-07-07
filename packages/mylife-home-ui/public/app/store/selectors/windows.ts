import { List } from 'immutable';
import { AppState } from '../types';
import { RepositoryState } from '../types/repository';
import { Window, Control, ControlDisplay, ControlText, ControlDisplayMapItem, VWindow, VControl } from '../types/windows';
import { getResources } from './resources';
import { getRepository } from './repository';
import { ResourcesState } from '../types/resources';

export const getWindows = (state: AppState) => state.windows;
export const getWindow = (state: AppState, { window }: { window: string }) => getWindows(state).get(window);
export const getWindowControl = (state: AppState, { window, control }: { window: string; control: string }) => getWindow(state, { window }).controls.get(control);
export const getWindowDisplay = (state: AppState, { window }: { window: string }) => prepareWindow(getResources(state), getRepository(state), getWindow(state, { window }));

function findDisplayItem(map: List<ControlDisplayMapItem>, value: any) {
  if (typeof value === 'number') {
    return map.find((item) => item.min <= value && value <= item.max) || null;
  }

  return map.find((item) => item.value === value) || null;
}

function prepareDisplay(resources: ResourcesState, repository: RepositoryState, display: ControlDisplay) {
  if (!display) {
    return null;
  }

  const defaultResource = resources.get(display.resource);

  if (!display.component || !display.map || !display.map.size) {
    return defaultResource;
  }
  const component = repository.get(display.component);
  if (!component || !component.has(display.attribute)) {
    return defaultResource;
  }
  const value = component.get(display.attribute);
  const item = findDisplayItem(display.map, value);
  if (!item) {
    return defaultResource;
  }

  return resources.get(item.resource);
}

function prepareText(resources: ResourcesState, repository: RepositoryState, text: ControlText) {
  if (!text) {
    return null;
  }

  const args = text.context
    .map((item) => {
      const component = repository.get(item.component);
      return component && component.get(item.attribute);
    })
    .toArray();

  try {
    return text.func(args);
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return err.message as string;
  }
}

function prepareControl(resources: ResourcesState, repository: RepositoryState, window: Window, control: Control): VControl {
  const { id, width, height, display, text, primaryAction } = control;

  return {
    id,
    width,
    height,
    left: window.width * control.x - width / 2,
    top: window.height * control.y - height / 2,
    display: prepareDisplay(resources, repository, display),
    text: prepareText(resources, repository, text),
    active: !!primaryAction,
  };
}

function prepareWindow(resources: ResourcesState, repository: RepositoryState, window: Window): VWindow {
  const { resource, controls, ...others } = window;
  return {
    resource: resource && resources.get(resource),
    controls: controls.toArray().map((ctrl) => prepareControl(resources, repository, window, ctrl)),
    ...others,
  };
}
