import { components } from 'mylife-home-common';
import { Component, MemberType, PluginUsage } from '../../../../shared/component-model';
import { PluginData, ComponentData, BreakingOperation, UiElementPath } from '../../../../shared/project-manager';
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
  const usageModel = new UsageModel(components, componentsUsage);

  const breakingOperations: BreakingOperation[] = [];

  // removed components
  const newModel = new ComponentsModel(newComponents);
  for (const actualComponent of components) {
    const usage = usageModel.findComponentUsage(actualComponent.id);
    if (!usage) {
      continue;
    }

    const newComponent = newModel.getComponent(actualComponent.id);

    if (!newComponent) {
      breakingOperations.push({
        operation: 'remove',
        componentId: actualComponent.id,
        usage
      });

      continue;
    }

    if (!isPluginCompatible(actualComponent.pluginId, actualComponent.plugin, newComponent.plugin, usageModel)) {
      breakingOperations.push({
        operation: 'update',
        componentId: actualComponent.id,
        usage
      });
    }
  }

  return breakingOperations;
}

function isPluginCompatible(actualId: string, actualPlugin: PluginData, newPlugin: PluginData, usageModel: UsageModel) {
  if (isPluginSame(actualPlugin, newPlugin)) {
    return true;
  }

  return false;

  for (const [memberName, member] of Object.entries(actualPlugin.members)) {
    // const memberUsage = usageModel.findPluginMemberUsage(actualPlugin.)
  }

  return true;
}

function isPluginSame(actualPlugin: PluginData, newPlugin: PluginData) {
  return actualPlugin.module === newPlugin.module && actualPlugin.name === newPlugin.name && actualPlugin.version === newPlugin.version;
}

class UsageModel {
  private readonly componentUsage = new Map<string, UiElementPath[]>();
  private readonly pluginUsage = new Map<string, UiElementPath[]>();
  private readonly pluginMemberUsage = new Map<string, UiElementPath[]>();

  constructor(components: ComponentsModel, usage: ComponentUsage[]) {

    for (const { componentId, memberName, path } of usage) {
      this.mapPush(this.componentUsage, componentId, path);
      const component = components.getComponent(componentId);
      this.mapPush(this.pluginUsage, component.pluginId, path);
      this.mapPush(this.pluginMemberUsage, this.buildPluginMemberKey(component.pluginId, memberName), path);
    }
  }

  findComponentUsage(componentId: string) {
    return this.componentUsage.get(componentId);
  }

  findPluginUsage(pluginId: string) {
    return this.pluginUsage.get(pluginId);
  }

  findPluginMemberUsage(pluginId: string, memberName: string) {
    return this.pluginMemberUsage.get(this.buildPluginMemberKey(pluginId, memberName));
  }

  private mapPush(map: Map<string, UiElementPath[]>, key: string, path: UiElementPath) {
    let array = map.get(key);
    if (!array) {
      array = [];
      map.set(key, array);
    }

    array.push(path);
  }

  private buildPluginMemberKey(pluginId: string, memberName: string) {
    return `${pluginId}$${memberName}`;
  }
}
