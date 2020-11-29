import { DefinitionResource, UiProject, Window, Control, ControlDisplay, ControlText, Action, ComponentData, ControlDisplayMapItem } from '../../../../shared/ui-model';
import * as uiV1 from './ui-v1-types';

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

export function convertUiProject(input: uiV1.Project): UiProject {
  const resources = input.Images.map(convertResource);
  const windows = input.Windows.map(convertWindow);
  const componentData = convertComponents(input.Components);

  const defaultWindow = {
    desktop: input.DesktopDefaultWindow,
    mobile: input.MobileDefaultWindow,
  };

  return {
    name: input.Name,
    definition: { resources, windows, defaultWindow },
    componentData,
  };
}

function convertResource(input: uiV1.Image): DefinitionResource {
  return {
    id: input.Id,
    mime: 'image/png',
    data: input.Content,
  };
}

function convertWindow(input: uiV1.Window): Window {
  const window: Window = {
    id: input.id,
    style: input.style || null,
    height: input.height,
    width: input.width,
    backgroundResource: input.background_resource_id,
    controls: [],
  };

  for (const inputControl of input.controls) {
    window.controls.push(convertControl(window, inputControl));
  }

  return window;
}

function convertControl(window: Window, input: uiV1.Control): Control {
  const control: Mutable<Control> = {
    id: input.id,
    style: input.style,
    height: input.height,
    width: input.width,
    x: input.x * window.width, // convert to absolute
    y: input.y * window.height, // convert to absolute
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

  // replace ids comp_id with comp-id (naming convention)
  replaceComponentId(control.primaryAction?.component, 'id');
  replaceComponentId(control.secondaryAction?.component, 'id');
  replaceComponentId(control.display, 'componentId');

  for (const item of control.text?.context || []) {
    replaceComponentId(item, 'componentId');
  }

  return control;
}

function convertDisplay(input: uiV1.Display): ControlDisplay {
  const display: ControlDisplay = {
    componentId: input.component_id,
    componentState: input.component_attribute,
    defaultResource: input.default_resource_id,
    map: [],
  };

  for (const inputItem of input.map) {
    const item: Mutable<ControlDisplayMapItem> = {
      resource: inputItem.resource_id,
      min: null,
      max: null,
      value: null,
    };

    if(inputItem.value != null) {
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
      id: item.id,
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
      id: input.component.component_id,
      action: input.component.component_action,
    };
  }

  if (input.window) {
    action.window = {
      id: input.window.id,
      popup: input.window.popup,
    };
  }

  return action;
}

function convertComponents(old: uiV1.Component[]): ComponentData {
  // TODO
}

function replaceComponentId(obj: { [prop: string]: string }, prop: string) {
  if (obj && obj[prop]) {
    obj[prop] = obj[prop].replace(/_/g, '-');
  }
}

function replaceKey(obj: { [prop: string]: string }, oldName: string, newName: string) {
  if (obj) {
    obj[newName] = obj[oldName];
    delete obj[oldName];
  }
}
