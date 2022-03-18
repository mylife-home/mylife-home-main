import { Action, ControlDisplay, ControlDisplayMapItem, ControlText, ControlTextContextItem } from '../../../../../../shared/ui-model';
import { UiWindow, UiControl } from '../../../../store/ui-designer/types';
import { clone } from '../../../lib/clone';

const WINDOW_TEMPLATE: UiWindow = {
  id: null,
  windowId: null,
  style: null,
  height: 500,
  width: 500,
  backgroundResource: null,
  controls: []
};

const CONTROL_DISPLAY_TEMPLATE: ControlDisplay = {
  componentId: null,
  componentState: null,
  defaultResource: null,
  map: [],
};

const CONTROL_TEXT_TEMPLATE: ControlText = {
  context: [],
  format: `return '';`,
};

const CONTROL_TEMPLATE: UiControl = {
  id: null,
  x: null,
  y: null,

  style: null,
  height: 50,
  width: 50,
  display: CONTROL_DISPLAY_TEMPLATE,
  text: null,
  primaryAction: null,
  secondaryAction: null,
};

const CONTROL_DISPLAY_MAP_ITEM_TEMPLATE: ControlDisplayMapItem = {
  min: null,
  max: null,
  value: null,
  resource: null,
};

const CONTROL_TEXT_CONTEXT_ITEM_TEMPLATE: ControlTextContextItem = {
  id: null,
  componentId: null,
  componentState: null,
};

const CONTROL_ACTION_COMPONENT_TEMPLATE: Action = {
  component: {
    id: null,
    action: null,
  },
  window: null,
};

const CONTROL_ACTION_WINDOW_TEMPLATE: Action = {
  component: null,
  window: {
    id: null,
    popup: false,
  },
};

/**
 * Note: window will miss id
 */
export function createNewWindow() {
  return clone(WINDOW_TEMPLATE);
}

/**
 * Note: control will miss id, x, y
 */
export function createNewControl() {
  return clone(CONTROL_TEMPLATE);
}

export function createNewControlDisplay() {
  return clone(CONTROL_DISPLAY_TEMPLATE);
}

export function createNewControlText() {
  return clone(CONTROL_TEXT_TEMPLATE);
}

export function createNewControlDisplayMapItem() {
  return clone(CONTROL_DISPLAY_MAP_ITEM_TEMPLATE);
}

export function createNewControlTextContextItem() {
  return clone(CONTROL_TEXT_CONTEXT_ITEM_TEMPLATE);
}

export function createNewControlActionComponent() {
  return clone(CONTROL_ACTION_COMPONENT_TEMPLATE);
}

export function createNewControlActionWindow() {
  return clone(CONTROL_ACTION_WINDOW_TEMPLATE);
}
