import rawHWGarden1 from './content/hw_rpi-home-garden1.json';
import rawHWSockets1 from './content/hw_rpi-home-sockets1.json';
import rawHWGarden4 from './content/hw_rpi0-home-garden4.json';
import rawHWCore from './content/hw_rpi2-home-core.json';
import rawHWEPanel1 from './content/hw_rpi2-home-epanel1.json';
import rawHWEPanel2 from './content/hw_rpi2-home-epanel2.json';
import rawHWGarden2 from './content/hw_rpi2-home-garden2.json';
import rawHWHallbox from './content/hw_rpi2-home-hallbox.json';
import rawVPanelCore from './content/vpanel_rpi2-home-core.json';

import { Plugin, Component, Binding, Member, PluginUsage, ConfigItem, MemberType, ConfigType } from '../store/core-designer/types';

export const hwGarden1 = processFile(rawHWGarden1);
export const hwSockets1 = processFile(rawHWSockets1);
export const hwGarden4 = processFile(rawHWGarden4);
export const hwCore = processFile(rawHWCore);
export const hwEPanel1 = processFile(rawHWEPanel1);
export const hwEPanel2 = processFile(rawHWEPanel2);
export const hwGarden2 = processFile(rawHWGarden2);
export const hwHallbox = processFile(rawHWHallbox);
export const vpanelCore = processFile(rawVPanelCore);

function processFile(file: raw.File) {
  const GRID_STEP = 24;

  const pluginMap = buildPluginMap(file);
  const plugins = Array.from(pluginMap.values());
  const components: Component[] = [];
  const bindings: Binding[] = [];

  for (const raw of file.Components) {
    const pluginId = `${raw.EntityName}:${raw.Component.library}.${raw.Component.type}`;
    const plugin = pluginMap.get(pluginId);

    const location = raw.Component.designer.find(item => item.Key === 'Location').Value;
    const parts = location.split(',');
    const x = Math.round(Number.parseInt(parts[0]) / GRID_STEP);
    const y = Math.round(Number.parseInt(parts[1]) / GRID_STEP);

    const id = raw.Component.id;

    components.push({
      id,
      plugin: pluginId,
      position: { x, y },
      config: raw.Component.config
    });

    for (const rawBinding of raw.Component.bindings) {
      const bindingId = `${rawBinding.remote_id}.${rawBinding.remote_attribute}->${id}.${rawBinding.local_action}`;
      bindings.push({
        id: bindingId,
        sourceComponent: rawBinding.remote_id,
        sourceState: rawBinding.remote_attribute,
        targetComponent: id,
        targetAction: rawBinding.local_action
      });
    }
  }

  return { plugins, components, bindings };
}

function buildPluginMap(file: raw.File) {
  const map = new Map<string, Plugin>();

  for (const entity of file.Toolbox) {
    for (const rawPlugin of entity.Plugins) {
      const id = `${entity.EntityName}:${rawPlugin.library}.${rawPlugin.type}`;
      const members: { [name: string]: Member; } = {};
      const config: { [name: string]: ConfigItem; } = {};
      const stateIds: string[] = [];
      const actionIds: string[] = [];
      const configIds: string[] = [];

      const classParts = rawPlugin.clazz.split('|').filter(x => x);
      for (const part of classParts) {
        const [name, type] = part.split(',');
        const propType = name.charAt(0);
        const propName = name.substr(1);
        switch (propType) {
          case '=':
            stateIds.push(propName);
            members[propName] = { description: `Description ${propName}`, memberType: MemberType.STATE, valueType: type };
            break;
          case '.':
            actionIds.push(propName);
            members[propName] = { description: `Description ${propName}`, memberType: MemberType.ACTION, valueType: type };
            break;
        }
      }

      const configParts = rawPlugin.config.split('|').filter(x => x);
      for(const part of configParts) {
        const [type, name] = part.split(':');
        config[name] = { description: `Description ${name}`, valueType: mapConfigType(type) };
        configIds.push(name);
      }

      stateIds.sort();
      actionIds.sort();
      configIds.sort();

      const plugin: Plugin = {
        id, 
        instanceName: entity.EntityName,
        name: rawPlugin.type,
        module: rawPlugin.library,
        usage: mapPluginUsage(rawPlugin.usage),
        version: rawPlugin.version,
        description: `Description ${id}`,
        members,
        config,
      
        stateIds,
        actionIds,
        configIds
      };

      map.set(id, plugin);
    }
  }

  return map;
}

function mapPluginUsage(usage: number) {
  switch(usage) {
    case 1:
      return PluginUsage.LOGIC; // or sensor
    case 2:
      return PluginUsage.UI;
    case 3: 
      return PluginUsage.ACTUATOR;
    default:
      throw new Error(`Unknown plugin usage: ${usage}`);
  }
}

function mapConfigType(type: string) {
  switch(type) {
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

namespace raw {
  export interface File {
    readonly Name: string;
    readonly CreationDate: string;
    readonly LastUpdate: string;
    readonly Components: ComponentContainer[];
    readonly Toolbox: ToolboxItem[];
  }

  export interface ComponentContainer {
    readonly EntityName: string;
    readonly Component: Component;
  }

  export interface Component {
    readonly id: string;
    readonly library: string;
    readonly type: string;
    readonly bindings: ComponentBinding[];
    readonly config: ComponentConfig[];
    readonly designer: ComponentDesigner[];
  }

  export interface ComponentBinding {
    readonly local_action: string;
    readonly remote_attribute: string;
    readonly remote_id: string;
  }

  export interface ComponentConfig {
    readonly Key: string;
    readonly Value: string;
  }

  export interface ComponentDesigner {
    readonly Key: string;
    readonly Value: string;
  }

  export interface ToolboxItem {
    readonly EntityName: string;
    readonly Plugins: Plugin[];
  }

  export interface Plugin {
    readonly clazz: string;
    readonly config: string;
    readonly library: string;
    readonly type: string;
    readonly usage: number;
    readonly version: string;
  }
}
