import { components } from 'mylife-home-common';
import { Component, MemberType, PluginUsage } from '../../../../shared/component-model';
import { PluginData, ComponentData } from '../../../../shared/project-manager';
import { Services } from '../..';

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
}

export class ComponentModel {
  constructor(private readonly component: Component, private readonly plugin: PluginData) {
  }

  get id() {
    return this.component.id;
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

export function prepareMergeComponentData(components: ComponentsModel, newComponents: ComponentData) {
  return null as string; 
}