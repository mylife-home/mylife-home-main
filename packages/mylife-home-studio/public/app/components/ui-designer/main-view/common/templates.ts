import { UiActionData, UiControlDisplayData, UiControlDisplayMapItemData, UiControlTextContextItemData, UiControlTextData } from '../../../../../../shared/project-manager';
import { UiControl } from '../../../../store/ui-designer/types';
import { clone } from '../../../lib/clone';

const CONTROL_DISPLAY_TEMPLATE: UiControlDisplayData = {
  componentId: null,
  componentState: null,
  defaultResource: null,
  map: [],
};

const CONTROL_TEXT_TEMPLATE: UiControlTextData = {
  context: [],
  format: `return '';`,
};

const CONTROL_DISPLAY_MAP_ITEM_TEMPLATE: UiControlDisplayMapItemData = {
  min: null,
  max: null,
  value: null,
  resource: null,
};

const CONTROL_TEXT_CONTEXT_ITEM_TEMPLATE: UiControlTextContextItemData = {
  id: null,
  componentId: null,
  componentState: null,
  testValue: null,
};

const CONTROL_ACTION_COMPONENT_TEMPLATE: UiActionData = {
  component: {
    id: null,
    action: null,
  },
  window: null,
};

const CONTROL_ACTION_WINDOW_TEMPLATE: UiActionData = {
  component: null,
  window: {
    id: null,
    popup: false,
  },
};

// Same than server side
export function newControlSize() {
  return {
    height: 50,
    width: 50,
  };
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
