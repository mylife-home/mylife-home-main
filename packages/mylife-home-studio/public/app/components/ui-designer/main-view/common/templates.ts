import { ControlDisplay, ControlText } from '../../../../../../shared/ui-model';
import { UiWindow, UiControl } from '../../../../store/ui-designer/types';
import { clone } from '../../../lib/clone';

const WINDOW_TEMPLATE: UiWindow = {
  id: null,
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
