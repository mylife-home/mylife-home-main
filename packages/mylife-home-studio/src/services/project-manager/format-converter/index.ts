import { DefinitionResource, UiProject, Window, Control, ControlDisplay, ControlText, Action, ComponentData, ControlDisplayMapItem } from '../../../../shared/ui-model';
import * as uiV1 from './ui-v1-types';

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// TODO: naming on window/control ids

export function convertUiProject(input: uiV1.Project): UiProject {
  const resources = input.Images.map(convertResource);
  const windows = input.Windows.map(convertWindow);
  const componentData = convertComponents(input.Components);

  const defaultWindow = {
    desktop: convertUiId(input.DesktopDefaultWindow),
    mobile: convertUiId(input.MobileDefaultWindow),
  };

  return {
    name: input.Name,
    definition: { resources, windows, defaultWindow },
    componentData,
  };
}

function convertResource(input: uiV1.Image): DefinitionResource {
  return {
    id: convertUiId(input.Id),
    mime: 'image/png',
    data: input.Content,
  };
}

function convertWindow(input: uiV1.Window): Window {
  const window: Window = {
    id: convertUiId(input.id),
    style: input.style || null,
    height: input.height,
    width: input.width,
    backgroundResource: convertUiId(input.background_resource_id),
    controls: [],
  };

  for (const inputControl of input.controls) {
    window.controls.push(convertControl(window, inputControl));
  }

  return window;
}

function convertControl(window: Window, input: uiV1.Control): Control {
  const control: Mutable<Control> = {
    id: convertUiId(input.id),
    style: input.style,
    height: input.height,
    width: input.width,
    x: Math.round(input.x * window.width), // convert to absolute
    y: Math.round(input.y * window.height), // convert to absolute
    display: null,
    text: null,
    primaryAction: null,
    secondaryAction: null,
  };

  if (input.display) {
    control.display = convertDisplay(input.display);
  }

  if (input.text) {
    control.text = convertText(input.text);
  }

  if (input.primary_action) {
    control.primaryAction = convertAction(input.primary_action);
  }

  if (input.secondary_action) {
    control.secondaryAction = convertAction(input.secondary_action);
  }

  return control;
}

function convertDisplay(input: uiV1.Display): ControlDisplay {
  const display: ControlDisplay = {
    componentId: convertComponentId(input.component_id),
    componentState: input.component_attribute,
    defaultResource: convertUiId(input.default_resource_id),
    map: [],
  };

  for (const inputItem of input.map) {
    const item: Mutable<ControlDisplayMapItem> = {
      resource: convertUiId(inputItem.resource_id),
      min: null,
      max: null,
      value: null,
    };

    if (inputItem.value != null) {
      // replace 'off' 'on' with true false
      switch (inputItem.value) {
        case 'on':
          item.value = true;
          break;
        case 'off':
          item.value = false;
          break;
        default:
          item.value = inputItem.value;
          break;
      }
    } else {
      item.min = inputItem.min;
      item.max = inputItem.max;
    }

    display.map.push(item);
  }

  return display;
}

function convertText(input: uiV1.Text): ControlText {
  const text: ControlText = {
    format: input.format,
    context: []
  };

  for (const item of input.context) {
    text.context.push({
      id: convertComponentId(item.id),
      componentId: item.component_id,
      componentState: item.component_attribute,
    });
  }

  return text;
}

function convertAction(input: uiV1.Action): Action {
  const action: Mutable<Action> = {
    component: null,
    window: null,
  };

  if (input.component) {
    action.component = {
      id: convertComponentId(input.component.component_id),
      action: input.component.component_action,
    };
  }

  if (input.window) {
    action.window = {
      id: convertUiId(input.window.id),
      popup: input.window.popup,
    };
  }

  return action;
}

function convertComponents(old: uiV1.Component[]): ComponentData {
  // TODO
}

// replace ids comp_id with comp-id (naming convention)
function convertComponentId(id: string) {
  return id.replace(/_/g, '-');
}

// same for ui objects
function convertUiId(id: string) {
  return id.replace(/_/g, '-');
}
