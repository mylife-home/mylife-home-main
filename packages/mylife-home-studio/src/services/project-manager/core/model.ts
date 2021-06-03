import { logger } from 'mylife-home-common';
import { ConfigItem, ConfigType, MemberType, Plugin } from '../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, CorePluginData, CoreProject, CoreToolboxDisplay } from '../../../../shared/project-manager';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export class Model {
  private readonly instances = new Map<string, InstanceModel>();
  private readonly plugins = new Map<string, PluginModel>();
  private readonly components = new Map<string, ComponentModel>();
  private readonly bindings = new Map<string, BindingModel>();

  constructor(public readonly data: CoreProject) {
    for (const [id, pluginData] of Object.entries(data.plugins)) {
      this.registerPlugin(id, pluginData);
    }

    for (const [id, componentData] of Object.entries(data.components)) {
      this.registerComponent(id, componentData);
    }

    for (const [id, componentData] of Object.entries(data.components)) {
      this.registerComponent(id, componentData);
    }

    for (const [id, bindingData] of Object.entries(data.bindings)) {
      const binding = this.registerBinding(bindingData);

      if (binding.id !== id) {
        log.error(`Binding id mismatch: '${binding.id}' != '${id}'`);
      }
    }
  }

  private getOrCreateInstance(instanceName: string) {
    const existing = this.instances.get(instanceName);
    if (existing) {
      return existing;
    }

    const newInstance = new InstanceModel(instanceName);
    this.instances.set(instanceName, newInstance);
    return newInstance;
  }

  private registerPlugin(id: string, pluginData: CorePluginData) {
    const instance = this.getOrCreateInstance(pluginData.instanceName);
    const plugin = new PluginModel(instance, id, pluginData);

    this.plugins.set(plugin.id, plugin);
    instance.registerPlugin(plugin);

    return plugin;
  }

  deletePlugin(id: string) {
    const plugin = this.getPlugin(id);
    this.plugins.delete(id);

    delete this.data.plugins[id];

    const { instance } = plugin;
    instance.unregisterPlugin(id);
    if (!instance.hasPlugins) {
      this.instances.delete(instance.instanceName);
    }
  }

  private registerComponent(id: string, componentData: CoreComponentData) {
    const plugin = this.getPlugin(componentData.plugin);
    const { instance } = plugin;
    const component = new ComponentModel(instance, plugin, id, componentData);

    this.components.set(component.id, component);
    plugin.registerComponent(component);
    instance.registerComponent(component);

    return component;
  }

  private registerBinding(bindingData: CoreBindingData) {
    const sourceComponent = this.getComponent(bindingData.sourceComponent);
    const targetComponent = this.getComponent(bindingData.targetComponent);
    const binding = new BindingModel(bindingData, sourceComponent, targetComponent);

    this.bindings.set(binding.id, binding);
    sourceComponent.registerBinding(binding);
    targetComponent.registerBinding(binding);

    return binding;
  }

  hasInstance(instanceName: string) {
    return this.instances.has(instanceName);
  }

  getInstance(instanceName: string) {
    const instance = this.instances.get(instanceName);
    if (!instance) {
      throw new Error(`Instance '${instanceName}' does not exist`);
    }

    return instance;
  }

  getInstancesNames() {
    return Array.from(this.instances.keys());
  }

  getPluginsIds() {
    return Array.from(this.plugins.keys());
  }

  hasPlugin(id: string) {
    return this.plugins.has(id);
  }

  getPlugin(id: string) {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Instance '${id}' does not exist`);
    }

    return plugin;
  }

  getComponentsIds() {
    return Array.from(this.components.keys());
  }

  hasComponent(id: string) {
    return this.components.has(id);
  }

  getComponent(id: string) {
    const component = this.components.get(id);
    if (!component) {
      throw new Error(`Instance '${id}' does not exist`);
    }

    return component;
  }

  setComponent(componentId: string, pluginId: string, x: number, y: number) {
    if (this.hasComponent(componentId)) {
      throw new Error(`Component id already exists: '${componentId}'`);
    }

    const plugin = this.getPlugin(pluginId);

    const componentData: CoreComponentData = {
      plugin: pluginId,
      position: { x, y },
      config: plugin.createConfigTemplate(),
      external: false,
    };

    const component = this.registerComponent(componentId, componentData);
    this.data.components[component.id] = component.data;

    return component;
  }

  renameComponent(id: string, newId: string) {
    if (this.hasComponent(newId)) {
      throw new Error(`Component id already exists: '${newId}'`);
    }

    const component = this.components.get(id);
    const plugin = component.plugin;
    const instance = component.instance;

    this.components.delete(component.id);
    plugin.unregisterComponent(component.id);
    instance.unregisterComponent(component.id);
    delete this.data.components[component.id];

    component.rename(newId);

    this.components.set(component.id, component);
    plugin.registerComponent(component);
    instance.registerComponent(component);
    this.data.components[component.id] = component.data;

    for (const binding of component.getAllBindings()) {
      this.bindings.delete(binding.id);
      binding.rebuild();
      this.bindings.set(binding.id, binding);
    }
  }

  clearComponent(id: string) {
    const component = this.components.get(id);

    const plugin = component.plugin;
    const instance = component.instance;

    this.components.delete(component.id);
    plugin.unregisterComponent(component.id);
    instance.unregisterComponent(component.id);

    delete this.data.components[component.id];
  }

  hasBindings() {
    return this.bindings.size > 0;
  }

  hasBinding(id: string) {
    return !!this.bindings.get(id);
  }

  getBindingsIds() {
    return Array.from(this.bindings.keys());
  }

  setBinding(bindingData: CoreBindingData) {
    const sourceComponent = this.getComponent(bindingData.sourceComponent);
    const targetComponent = this.getComponent(bindingData.targetComponent);

    if (sourceComponent === targetComponent) {
      throw new Error('Cannot create binding on self');
    }

    const sourceType = sourceComponent.plugin.getMemberType(bindingData.sourceState, MemberType.STATE);
    const targetType = targetComponent.plugin.getMemberType(bindingData.targetAction, MemberType.ACTION);
    if (sourceType !== targetType) {
      throw new Error(`Cannot create binding from '${sourceType}' to '${targetType}'`);
    }

    const candidateId = BindingModel.makeId(bindingData);
    if (this.hasBinding(candidateId)) {
      throw new Error(`Binding id already exists: '${candidateId}'`);
    }

    const binding = this.registerBinding(bindingData);
    this.data.bindings[binding.id] = binding.data;
    return binding;
  }

  clearBinding(id: string) {
    const binding = this.bindings.get(id);

    this.bindings.delete(binding.id);
    binding.sourceComponent.unregisterBinding(binding);
    binding.targetComponent.unregisterBinding(binding);

    delete this.data.bindings[binding.id];
  }

  // Note: impacts checks are already done
  importPlugin(instanceName: string, netPlugin: Plugin) {
    const pluginData: CorePluginData = {
      ...netPlugin,
      instanceName,
      toolboxDisplay: 'show'
    };

    const id = `${instanceName}:${netPlugin.module}.${netPlugin.name}`;
    const plugin = this.registerPlugin(id, pluginData);
    this.data.plugins[id] = pluginData;

    return plugin;
  }

  // Note: impacts checks are already done
  importComponent(id: string, pluginId: string, external: boolean, config: { [id: string]: ConfigItem }) {
    const plugin = this.getPlugin(pluginId);

    const componentData: CoreComponentData = {
      plugin: pluginId,
      position: { x: 1, y: 1 },
      config,
      external,
    };

    const component = this.registerComponent(id, componentData);
    this.data.components[component.id] = component.data;

    return component;
  }
}

export class InstanceModel {
  public readonly components = new Map<string, ComponentModel>();
  public readonly plugins = new Map<string, PluginModel>();

  constructor(public readonly instanceName: string) { }

  registerPlugin(plugin: PluginModel) {
    this.plugins.set(plugin.id, plugin);
  }

  unregisterPlugin(id: string) {
    this.plugins.delete(id);
  }

  registerComponent(component: ComponentModel) {
    this.components.set(component.id, component);
  }

  unregisterComponent(id: string) {
    this.components.delete(id);
  }

  get hasComponents() {
    return this.components.size > 0;
  }

  get hasPlugins() {
    return this.plugins.size > 0;
  }

  updateAllPluginsDisplay(wantedDisplay: CoreToolboxDisplay) {
    const pluginIds = [];

    for (const plugin of this.plugins.values()) {
      if (plugin.updateDisplay(wantedDisplay)) {
        pluginIds.push(plugin.id);
      }
    }

    return pluginIds;
  }

  getAllUnusedPluginIds() {
    const pluginIds = [];

    for (const plugin of this.plugins.values()) {
      if (!plugin.used) {
        pluginIds.push(plugin.id);
      }
    }

    return pluginIds;
  }
}

export class PluginModel {
  public readonly components = new Map<string, ComponentModel>();

  constructor(public readonly instance: InstanceModel, private _id: string, public readonly data: CorePluginData) { }

  get id() {
    return this._id;
  }

  registerComponent(component: ComponentModel) {
    this.components.set(component.id, component);
  }

  unregisterComponent(id: string) {
    this.components.delete(id);
  }

  get used() {
    return this.components.size > 0;
  }

  getMemberType(name: string, type: MemberType) {
    const member = this.data.members[name];
    if (!member || member.memberType !== type) {
      throw new Error(`Member '${name}' of type '${type}' does not exist on plugin '${this.id}'`);
    }

    return member.valueType;
  }

  updateDisplay(wantedDisplay: CoreToolboxDisplay) {
    if (this.data.toolboxDisplay === wantedDisplay) {
      return false;
    }

    this.data.toolboxDisplay = wantedDisplay;
    return true;
  }

  createConfigTemplate() {
    const template: { [name: string]: any; } = {};

    for (const [name, { valueType }] of Object.entries(this.data.config)) {
      switch (valueType) {
        case ConfigType.STRING:
          template[name] = '';
          break;

        case ConfigType.BOOL:
          template[name] = false;
          break;

        case ConfigType.INTEGER:
        case ConfigType.FLOAT:
          template[name] = 0;
          break;

        default:
          throw new Error(`Unsupported config type: '${valueType}'`);
      }
    }

    return template;
  }

  validateConfigValue(configId: string, configValue: any) {
    const item = this.data.config[configId];
    if (!item) {
      throw new Error(`Config '${configId}' does not exist on plugin '${this.id}'`);
    }

    switch (item.valueType) {
      case ConfigType.STRING:
        if (typeof configValue !== 'string') {
          throw new Error(`Expected config ${configId}' on plugin '${this.id}' to be a string but got '${JSON.stringify(configValue)}'.`);
        }
        break;

      case ConfigType.BOOL:
        if (typeof configValue !== 'boolean') {
          throw new Error(`Expected config ${configId}' on plugin '${this.id}' to be a bool but got '${JSON.stringify(configValue)}'.`);
        }
        break;

      case ConfigType.INTEGER:
        if (!Number.isInteger(configValue)) {
          throw new Error(`Expected config ${configId}' on plugin '${this.id}' to be an integer but got '${JSON.stringify(configValue)}'.`);
        }
        break;

      case ConfigType.FLOAT:
        if (typeof configValue !== 'number') {
          throw new Error(`Expected config ${configId}' on plugin '${this.id}' to be a float but got '${JSON.stringify(configValue)}'.`);
        }
        break;
    }
  }
}

export class ComponentModel {
  private bindingsFrom = new Set<BindingModel>();
  private bindingsTo = new Set<BindingModel>();

  constructor(public readonly instance: InstanceModel, public readonly plugin: PluginModel, private _id: string, public readonly data: CoreComponentData) { }

  get id() {
    return this._id;
  }

  rename(newId: string) {
    this._id = newId;
  }

  move(x: number, y: number) {
    this.data.position = { x, y };
  }

  configure(configId: string, configValue: any) {
    this.plugin.validateConfigValue(configId, configValue);
    this.data.config[configId] = configValue;
  }

  registerBinding(binding: BindingModel) {
    if (binding.sourceComponent === this) {
      this.bindingsFrom.add(binding);
    }
    if (binding.targetComponent === this) {
      this.bindingsTo.add(binding);
    }
  }

  unregisterBinding(binding: BindingModel) {
    if (binding.sourceComponent === this) {
      this.bindingsFrom.delete(binding);
    }
    if (binding.targetComponent === this) {
      this.bindingsTo.delete(binding);
    }
  }

  *getBindingsFrom() {
    for (const binding of this.bindingsFrom) {
      yield binding;
    }
  }

  *getBindingsTo() {
    for (const binding of this.bindingsTo) {
      yield binding;
    }
  }

  *getAllBindings() {
    for (const binding of this.bindingsFrom) {
      yield binding;
    }

    for (const binding of this.bindingsTo) {
      yield binding;
    }
  }

  *getAllBindingsIds() {
    for (const binding of this.getAllBindings()) {
      yield binding.id;
    }
  }

  *getAllBindingsWithMember(memberName: string) {
    const memberType = this.plugin.data.members[memberName].memberType;

    switch (memberType) {
      case MemberType.STATE:
        for (const binding of this.bindingsFrom) {
          if (binding.sourceState === memberName) {
            yield binding;
          }
        }
        break;

      case MemberType.ACTION:
        for (const binding of this.bindingsTo) {
          if (binding.targetAction === memberName) {
            yield binding;
          }
        }
        break;

    }
  }
}

// Note: bindings have no update, then can only be created or deleted
export class BindingModel {
  private _id: string;

  constructor(public readonly data: CoreBindingData, public readonly sourceComponent: ComponentModel, public readonly targetComponent: ComponentModel) {
    this.rebuild();
  }

  static makeId(data: CoreBindingData) {
    return `${data.sourceComponent}:${data.sourceState}:${data.targetComponent}:${data.targetAction}`;;
  }

  rebuild() {
    this.data.sourceComponent = this.sourceComponent.id;
    this.data.targetComponent = this.targetComponent.id;
    this._id = BindingModel.makeId(this.data);
  }

  get id() {
    return this._id;
  }

  get sourceState() {
    return this.data.sourceState;
  }

  get targetAction() {
    return this.data.targetAction;
  }

}
