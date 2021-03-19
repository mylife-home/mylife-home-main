import deepEqual from 'deep-equal';
import { components } from 'mylife-home-common';
import { ConfigItem, ConfigType, Member, MemberType, PluginUsage } from '../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, CorePluginData, CoreProject } from '../../../../shared/project-manager';
import * as coreV1 from './v1-types';

export { coreV1 };

export function convertCoreProject(input: coreV1.Project): CoreProject {
  const project: CoreProject = {
    name: input.Name,
    plugins: {},
    components: {},
    bindings: {}
  };

  for (const toolboxItem of input.Toolbox) {
    const instanceName = convertEntityName(toolboxItem.EntityName);
    for (const inputPlugin of toolboxItem.Plugins) {
      const { id, plugin } = convertPlugin(inputPlugin, instanceName);
      project.plugins[id] = plugin;
    }
  }

  for (const componentContainer of input.Components) {
    const { id, component } = convertComponent(componentContainer, project.plugins);
    project.components[id] = component;
  }

  for (const componentContainer of input.Components) {
    const componentId = componentContainer.Component.id;
    for (const inputBinding of componentContainer.Component.bindings) {
      const { id, binding } = convertBinding(inputBinding, componentId);
      project.bindings[id] = binding;
    }
  }

  // on vpanel project, mark all hw components as external
  if (isVPanelProject(project)) {
    for (const component of Object.values(project.components)) {
      const plugin = project.plugins[component.plugin];
      if (plugin.usage !== PluginUsage.LOGIC && plugin.usage !== PluginUsage.UI) {
        component.external = true;
        component.config = null;
      }
    }
  }

  return project;
}

function isVPanelProject(project: CoreProject) {
  for (const component of Object.values(project.components)) {
    const plugin = project.plugins[component.plugin];
    if (plugin.usage === PluginUsage.LOGIC) {
      return true;
    }
  }

  return false;
}

function convertPlugin(input: coreV1.Plugin, instanceName: string): { id: string; plugin: CorePluginData; } {
  const id = `${instanceName}:${input.library}.${input.type}`;
  const members = convertPluginMembers(input.clazz);

  const config: { [name: string]: ConfigItem; } = {};
  const configParts = input.config.split('|').filter(x => x);
  for (const part of configParts) {
    const [type, name] = part.split(':');
    config[name] = {
      description: null, // v1 model has no description
      valueType: convertConfigType(type),
    };
  }

  const plugin: CorePluginData = {
    instanceName,
    name: input.type,
    module: input.library,
    usage: convertPluginUsage(input.usage),
    version: input.version,
    description: null, // v1 model has no description
    members,
    config,
    toolboxDisplay: 'show',
  };

  return { id, plugin };
}

/**
 * Convert (parse) plugin members
 * @param input v1 clazz
 * @description exported because used by Ui project converter
 */
export function convertPluginMembers(input: string) {
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

function convertConfigType(type: string) {
  switch (type) {
    case 'i':
      return ConfigType.INTEGER;
    case 's':
      return ConfigType.STRING;
    case 'b':
      return ConfigType.BOOL;
    default:
      throw new Error(`Unknown config type: ${type}`);
  }
}

function convertPluginUsage(usage: number) {
  switch (usage) {
    case 1:
      return PluginUsage.LOGIC;
    case 2:
      return PluginUsage.UI;
    case 3:
      return PluginUsage.ACTUATOR; // or sensor
    default:
      throw new Error(`Unknown plugin usage: ${usage}`);
  }
}

function convertComponent(input: coreV1.ComponentContainer, pluginMap: { [id: string]: CorePluginData; }) {
  const inputComponent = input.Component;
  const id = inputComponent.id;
  const pluginId = `${convertEntityName(input.EntityName)}:${inputComponent.library}.${inputComponent.type}`;
  const plugin = pluginMap[pluginId];

  const component: CoreComponentData = {
    plugin: pluginId,
    position: convertPosition(inputComponent.designer),
    config: convertConfig(inputComponent.config, plugin),
    external: false,
  };

  return { id, component };
}

function convertPosition(input: coreV1.ComponentDesigner[]) {
  const GRID_STEP = 24;
  const DESIGNER_KEY = 'Location';

  const location = input.find(item => item.Key === DESIGNER_KEY).Value;
  const parts = location.split(',');
  const x = Math.round(Number.parseInt(parts[0]) / GRID_STEP);
  const y = Math.round(Number.parseInt(parts[1]) / GRID_STEP);
  return { x, y };
}

function convertConfig(input: coreV1.ComponentConfig[], plugin: CorePluginData) {
  const config: { [id: string]: any; } = {};

  for (const item of input) {
    const type = plugin.config[item.Key].valueType;
    const value = convertConfigValue(item.Value, type);
    config[item.Key] = value;
  }

  return config;
}

function convertConfigValue(value: string, type: ConfigType) {
  switch (type) {
    case ConfigType.BOOL:
      return value === 'true';

    case ConfigType.FLOAT:
      return parseFloat(value);

    case ConfigType.INTEGER:
      return parseInt(value, 10);

    case ConfigType.STRING:
      return value;
  }
}

function convertBinding(input: coreV1.ComponentBinding, componentId: string) {
  const binding: CoreBindingData = {
    sourceComponent: input.remote_id,
    sourceState: input.remote_attribute,
    targetComponent: componentId,
    targetAction: input.local_action
  };

  const id = `${binding.sourceComponent}:${binding.sourceState}:${binding.targetComponent}:${binding.targetAction}`;

  return { id, binding };
}

function convertEntityName(entityName: string) {
  const PREFIX = 'mylife-home-core_';
  if (entityName.startsWith(PREFIX)) {
    return entityName.substr(PREFIX.length);
  }

  return entityName;
}