import { components } from 'mylife-home-common';
import { Component, MemberType, PluginUsage } from '../../../../shared/component-model';
import { UiPluginData, UiComponentData, UiBreakingOperation } from '../../../../shared/project-manager';
import { Services } from '../..';
import { ComponentUsage } from './definition-model';
import { CoreOpenedProject } from '../core/opened-project';

export interface NewComponentData {
  components: { [id: string]: UiComponentData };
  plugins: { [id: string]: UiPluginData; };
}

export class ComponentsModel {
  private readonly map = new Map<string, ComponentModel>();
  private readonly components: { [id: string]: UiComponentData };
  private readonly plugins: { [id: string]: UiPluginData; };

  constructor(componentData: NewComponentData) {
    // Keep same objects here because we have direct model
    this.components = componentData.components;
    this.plugins = componentData.plugins;

    this.rebuild();
  }

  apply(componentData: NewComponentData) {
    for (const id of Object.keys(this.components)) {
      delete this.components[id];
    }

    for (const [id, data] of Object.entries(componentData.components)) {
      this.components[id] = data;
    }

    for (const id of Object.keys(this.plugins)) {
      delete this.plugins[id];
    }

    for (const [id, data] of Object.entries(componentData.plugins)) {
      this.plugins[id] = data;
    }

    this.rebuild();
  }

  private rebuild() {
    this.map.clear();

    for (const [id, component] of Object.entries(this.components)) {
      const plugin = this.plugins[component.plugin];
      const item = new ComponentModel(id, component, plugin);
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
  constructor(public readonly id: string, private readonly component: UiComponentData, public readonly plugin: UiPluginData) {
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

  const componentData: NewComponentData = {
    components: {},
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

    componentData.components[component.id] = {
      plugin: pluginId
    };
  }

  return componentData;
}

export function loadCoreProjectComponentData(project: CoreOpenedProject) {
  const componentData: NewComponentData = {
    components: {},
    plugins: {},
  };

  for (const id of project.view.getComponentsIds()) {
    const componentView = project.view.getComponent(id);
    const pluginView = componentView.plugin;

    if (pluginView.data.usage !== PluginUsage.UI) {
      continue;
    }

    if (!componentData.plugins[pluginView.id]) {
      const plugin: UiPluginData = {
        instanceName: pluginView.instance.instanceName,
        module: pluginView.data.module,
        name: pluginView.data.name,
        version: pluginView.data.version,
        description: pluginView.data.description,
        members: {}
      };

      for (const [id, member] of Object.entries(pluginView.data.members)) {
        plugin.members[id] = { ...member };
      }

      componentData.plugins[pluginView.id] = plugin;
    }

    componentData.components[componentView.id] = {
      plugin: pluginView.id
    };
  }

  return componentData;
}

export function prepareMergeComponentData(components: ComponentsModel, componentsUsage: ComponentUsage[], componentData: NewComponentData) {
  const usageModel = new UsageModel(components, componentsUsage);
  const usageToClear: ComponentUsage[] = [];

  const breakingOperations: UiBreakingOperation[] = [];

  // removed components
  const newModel = new ComponentsModel(componentData);
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
        usage: usage.map(item => item.path)
      });

      for (const item of usage) {
        usageToClear.push(item);
      }

      continue;
    }

    if (!isPluginCompatible(actualComponent.pluginId, actualComponent.plugin, newComponent.plugin, usageModel)) {
      breakingOperations.push({
        operation: 'update',
        componentId: actualComponent.id,
        usage: usage.map(item => item.path)
      });

      for (const item of usage) {
        usageToClear.push(item);
      }
    }
  }

  return { breakingOperations, usageToClear };
}

function isPluginCompatible(actualId: string, actualPlugin: UiPluginData, newPlugin: UiPluginData, usageModel: UsageModel) {
  if (isPluginSame(actualPlugin, newPlugin)) {
    return true;
  }

  for (const [memberName, actualMember] of Object.entries(actualPlugin.members)) {
    if (!usageModel.findPluginMemberUsage(actualId, memberName)) {
      continue;
    }

    const newMember = newPlugin.members[memberName];
    if (!newMember) {
      return false;
    }

    if (!isTypeCompatible(actualMember.valueType, newMember.valueType)) {
      return false;
    }
  }
  return true;
}

function isPluginSame(actualPlugin: UiPluginData, newPlugin: UiPluginData) {
  return actualPlugin.module === newPlugin.module && actualPlugin.name === newPlugin.name && actualPlugin.version === newPlugin.version;
}

function isTypeCompatible(actualValueType: string, newValueType: string) {
  if (actualValueType === newValueType) {
    return true;
  }

  const actualType = components.metadata.parseType(actualValueType);
  const newType = components.metadata.parseType(newValueType);

  // type promotion: enum -> text
  if (actualType.typeId === 'enum' && newType.typeId === 'text') {
    return true;
  }

  // type promotion: range -> float
  if (actualType.typeId === 'range' && newType.typeId === 'float') {
    return true;
  }

  // type promotion: range -> bigger range
  if (actualType.typeId === 'range' && newType.typeId === 'range') {
    const actualRange = actualType as components.metadata.Range;
    const newRange = newType as components.metadata.Range;
    if (actualRange.min >= newRange.min && actualRange.max <= newRange.max) {
      return true;
    }
  }

  // type promotion: enum -> bigger enum
  if (actualType.typeId === 'enum' && newType.typeId === 'enum') {
    const actualEnum = actualType as components.metadata.Enum;
    const newEnum = newType as components.metadata.Enum;
    const newValues = new Set(newEnum.values);
    if (actualEnum.values.every(value => newValues.has(value))) {
      return true;
    }
  }

  return false;
}

class UsageModel {
  private readonly componentUsage = new Map<string, ComponentUsage[]>();
  private readonly pluginMemberUsage = new Map<string, ComponentUsage[]>();

  constructor(components: ComponentsModel, usage: ComponentUsage[]) {
    for (const item of usage) {
      const { componentId, memberName } = item;
      this.mapPush(this.componentUsage, componentId, item);
      const component = components.getComponent(componentId);
      this.mapPush(this.pluginMemberUsage, this.buildPluginMemberKey(component.pluginId, memberName), item);
    }
  }

  findComponentUsage(componentId: string) {
    return this.componentUsage.get(componentId);
  }

  findPluginMemberUsage(pluginId: string, memberName: string) {
    return this.pluginMemberUsage.get(this.buildPluginMemberKey(pluginId, memberName));
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
