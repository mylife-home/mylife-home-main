import { components } from 'mylife-home-common';
import { Component, MemberType, PluginUsage } from '../../../../shared/component-model';
import { PluginData, ComponentData, BreakingOperation } from '../../../../shared/project-manager';
import { Services } from '../..';
import { ComponentUsage } from './definition-model';

export class ComponentsModel {
  private readonly map = new Map<string, ComponentModel>();

  constructor(readonly componentData: ComponentData) {
    this.rebuild();
  }

  rebuild() {
    this.map.clear();

    for (const component of this.componentData.components) {
      const plugin = this.componentData.plugins[component.plugin];
      const item = new ComponentModel(component, plugin);
      this.map.set(item.id, item);
    }
  }

  has(componentId: string) {
    return this.map.has(componentId);
  }

  findComponentMemberValueType(componentId: string, memberName: string, memberType: MemberType) {
    const component = this.map.get(componentId);
    return component?.findMemberValueType(memberName, memberType);
  }

  getComponent(componentId: string) {
    return this.map.get(componentId);
  }

  *[Symbol.iterator]() {
    for (const component of this.map.values()) {
      yield component;
    }
  }
}

class ComponentModel {
  constructor(private readonly component: Component, public readonly plugin: PluginData) {
  }

  get id() {
    return this.component.id;
  }

  get pluginId() {
    return this.component.plugin;
  }

  findMemberValueType(memberName: string, memberType: MemberType) {
    const member = this.plugin.members[memberName];
    if (!member || member.memberType !== memberType) {
      return;
    }

    return member.valueType;
  }
}

export function loadOnlineComponentData() {
  const onlineData = Services.instance.online.getComponentsData();

  const componentData: ComponentData = {
    components: [],
    plugins: {}
  };

  for (const { instanceName, component } of onlineData) {
    const { plugin } = component;
    if (plugin.usage !== PluginUsage.UI) {
      continue;
    }

    const pluginId = `${instanceName}:${plugin.module}.${plugin.name}`;
    if (!componentData.plugins[pluginId]) {
      const netPlugin = components.metadata.encodePlugin(plugin);
      componentData.plugins[pluginId] = {
        instanceName,
        name: netPlugin.name,
        module: netPlugin.module,
        version: netPlugin.version,
        description: netPlugin.description,
        members: netPlugin.members,
      };
    }

    componentData.components.push({
      id: component.id,
      plugin: pluginId
    });
  }

  return componentData;
}

export function prepareMergeComponentData(components: ComponentsModel, componentsUsage: ComponentUsage[], newComponents: ComponentData) {
  const usage = new UsageModel(components, componentsUsage);

  const breakingOperations: BreakingOperation[] = [];

  const newIds = new Set(newComponents.components.map(component => component.id));
  for (const component of components) {
    if (!newIds.has(component.id)) {

    }
  }

  return breakingOperations;
}

function isPluginSame(actualPlugin: PluginData, newPlugin: PluginData) {
  return actualPlugin.module === newPlugin.module && actualPlugin.name === newPlugin.name && actualPlugin.version === newPlugin.version;
}
/*
// TODO: must have usage (used state, used action)
function isPluginCompatible(actualPlugin: PluginData, newPlugin: PluginData) {
  for(const [memberName, member] of Object.entries(actualPlugin.members)) {
    
  }
}
*/

class UsageModel {
  private readonly componentUsage = new Map<string, ComponentUsage[]>();
  private readonly pluginUsage = new Map<string, ComponentUsage[]>();
  private readonly pluginMemberUsage = new Map<string, ComponentUsage[]>();

  constructor(components: ComponentsModel, usage: ComponentUsage[]) {

    for (const item of usage) {
      this.mapPush(this.componentUsage, item.componentId, item);
      const component = components.getComponent(item.componentId);
      this.mapPush(this.pluginUsage, component.pluginId, item);
      this.mapPush(this.pluginMemberUsage, this.buildPluginMemberKey(component.pluginId, item.memberName), item);
    }
  }

  private mapPush(map: Map<string, ComponentUsage[]>, key: string, usage: ComponentUsage) {
    let array = map.get(key);
    if (!array) {
      array = [];
      map.set(key, array);
    }

    array.push(usage);
  }

  private buildPluginMemberKey(pluginId: string, memberName: string) {
    return `${pluginId}$${memberName}`;
  }
}
