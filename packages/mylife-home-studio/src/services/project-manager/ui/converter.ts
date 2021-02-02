import { DefinitionResource, Window, Control, ControlDisplay, ControlText, Action, ControlDisplayMapItem } from '../../../../shared/ui-model';
import { UiProject, UiComponentData, UiPluginData } from '../../../../shared/project-manager';
import * as uiV1 from './v1-types';
import { convertPluginMembers } from '../core/converter';

export { uiV1 };

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

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
    // convert to absolute + old point is from control middle
    x: Math.round((window.width * input.x) - (input.width / 2)),
    y: Math.round((window.height * input.y) - (input.height / 2)),
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

  // try to guess if we should use min/max or range
  // there is no float in v1, so if min/max this is range
  const isMinMax = !!input.map.find(item => (typeof item.min === 'number' || typeof item.max === 'number'));

  for (const inputItem of input.map) {
    const item: Mutable<ControlDisplayMapItem> = {
      resource: convertUiId(inputItem.resource_id),
      min: null,
      max: null,
      value: null,
    };

    if (isMinMax) {
      item.min = inputItem.min || 0; // could be null in v1
      item.max = inputItem.max || 100; // could be null in v1, existing UI plugins are only range[0;100]
    } else {
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
      componentId: convertComponentId(item.component_id),
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

function convertComponents(input: uiV1.Component[]): UiComponentData {
  const componentData: UiComponentData = {
    components: [],
    plugins: {}
  };

  for (const { Id: inputId, Plugin: inputPlugin } of input) {
    const pluginId = convertPlugin(componentData.plugins, inputPlugin);

    componentData.components.push({
      id: convertComponentId(inputId),
      plugin: pluginId
    });
  }

  return componentData;
}

function convertPlugin(plugins: { [id: string]: UiPluginData; }, input: uiV1.Plugin) {
  // v1 model has no instance-name data, but all UI components were on only one instance
  const instanceName = 'unknown';
  const module = input.library;
  const name = input.type;
  const pluginId = `${instanceName}:${module}.${name}`;

  if (!plugins[pluginId]) {
    plugins[pluginId] = {
      instanceName,
      description: null, // v1 model has no description
      name,
      module,
      version: input.version,
      members: convertPluginMembers(input.clazz),
    };
  }

  return pluginId;
}

// replace ids comp_id with comp-id (naming convention)
function convertComponentId(id: string) {
  return id && id.replace(/_/g, '-');
}

// same for ui objects
function convertUiId(id: string) {
  return id && id.replace(/_/g, '-');
}

