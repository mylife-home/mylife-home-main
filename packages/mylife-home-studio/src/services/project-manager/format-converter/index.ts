import deepEqual from 'deep-equal';
import { components } from 'mylife-home-common';
import { DefinitionResource, UiProject, Window, Control, ControlDisplay, ControlText, Action, ComponentData, ControlDisplayMapItem, PluginData } from '../../../../shared/ui-model';
import { Member, MemberType } from '../../../../shared/component-model';
import * as uiV1 from './ui-v1-types';

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

function convertComponents(input: uiV1.Component[]): ComponentData {
  const componentData: ComponentData = {
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

function convertPlugin(plugins: { [id: string]: PluginData; }, input: uiV1.Plugin) {
  // v1 model has no instance-name data, but all UI components were on only one instance
  const instanceName = 'unknown';
  const module = input.library;
  const name = input.type;
  const pluginId = `${instanceName}:${module}.${name}`;

  if (plugins[pluginId]) {
    return pluginId;
  }

  plugins[pluginId] = {
    instanceName,
    description: null, // v1 model has no description
    name,
    module,
    version: input.version,
    members: convertPluginMembers(input.clazz),
  };
}

// TODO: share with component convertion
function convertPluginMembers(input: string) {
  const members: { [name: string]: Member; } = {};

  const inputMembers = input.split('|').filter(item => item);
  for (const inputMember of inputMembers) {
    const [name, inputType] = inputMember.substr(1).split(',');
    const valueType = convertType(inputType);
    const memberType = convertMemberType(inputMember[0]);

    members[name] = {
      memberType,
      valueType: valueType.toString(),
      description: null, // v1 model has no description
    };
  }

  return members;
}

// TODO: share with component convertion
function convertType(input: string) {
  // type can be null in old model (ui button actions), we switch to boolean
  if (!input) {
    return new components.metadata.Bool();
  }

  // https://github.com/mylife-home/mylife-home-core/blob/master/lib/metadata/type.js

  if (input.startsWith('[') && input.endsWith(']')) {
    const trimmed = input.substr(1, input.length - 2);
    const parts = trimmed.split(';');
    if (parts.length !== 2) {
      throw new Error(`Invalid type: ${input}`);
    }

    const min = parseInt(parts[0]);
    const max = parseInt(parts[1]);

    return new components.metadata.Range(min, max);
  }

  if (input.startsWith('{') && input.endsWith('}')) {
    const trimmed = input.substr(1, input.length - 2);
    const parts = trimmed.split(';');
    parts.sort();

    if (isSameEnum(parts, ['off', 'on'])) {
      // consider it is ported as boolean now
      return new components.metadata.Bool();
    }

    return new components.metadata.Enum(...parts);
  }

  throw new Error(`Invalid type: ${input}`);
}

function isSameEnum(enum1: string[], enum2: string[]) {
  const e1 = enum1.slice().sort();
  const e2 = enum2.slice().sort();
  return deepEqual(e1, e2);
}

function convertMemberType(input: string) {
  switch (input) {
    case '=':
      return MemberType.STATE;
    case '.':
      return MemberType.ACTION;
    default: throw new Error(`Unsupported member type: ${input}`);
  }
}

// replace ids comp_id with comp-id (naming convention)
function convertComponentId(id: string) {
  return id.replace(/_/g, '-');
}

// same for ui objects
function convertUiId(id: string) {
  return id.replace(/_/g, '-');
}

