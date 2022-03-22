import { logger } from 'mylife-home-common';
import { ConfigItem, ConfigType, MemberType, Plugin } from '../../../../shared/component-model';
import { CoreBindingData, CoreComponentData, CorePluginData, CoreProject, CoreToolboxDisplay, CoreView, CoreTemplate } from '../../../../shared/project-manager';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export abstract class ViewModel {
  private readonly components = new Map<string, ComponentModel>();
  private readonly bindings = new Map<string, BindingModel>();

  abstract readonly data: CoreView;
  protected abstract readonly project: Model;

  private get template(): TemplateModel {
    return (this instanceof TemplateModel) ? this : null;
  }

  // call after project ctor
  protected init() {
    for (const [id, componentData] of Object.entries(this.data.components)) {
      this.registerComponent(id, componentData);
    }

    for (const [id, bindingData] of Object.entries(this.data.bindings)) {
      const binding = this.registerBinding(bindingData);

      if (binding.id !== id) {
        log.error(`Binding id mismatch: '${binding.id}' != '${id}'`);
      }
    }
  }

  protected registerComponent(id: string, componentData: CoreComponentData) {
    const plugin = this.project.getPlugin(componentData.plugin);
    const { instance } = plugin;
    const component = new ComponentModel(instance, plugin, this.template, id, componentData);

    this.components.set(component.id, component);
    plugin.registerComponent(component);
    instance.registerComponent(component);

    return component;
  }

  protected registerBinding(bindingData: CoreBindingData) {
    const sourceComponent = this.getComponent(bindingData.sourceComponent);
    const targetComponent = this.getComponent(bindingData.targetComponent);
    const binding = new BindingModel(this.template, bindingData, sourceComponent, targetComponent);

    this.bindings.set(binding.id, binding);
    sourceComponent.registerBinding(binding);
    targetComponent.registerBinding(binding);

    return binding;
  }
  
  getComponentsIds() {
    return Array.from(this.components.keys());
  }

  hasComponent(id: string) {
    return this.components.has(id);
  }

  findComponent(id: string) {
    return this.components.get(id);
  }

  getComponent(id: string) {
    const component = this.components.get(id);
    if (!component) {
      throw new Error(`Component '${id}' does not exist`);
    }

    return component;
  }

  setComponent(componentId: string, pluginId: string, x: number, y: number) {
    if (this.hasComponent(componentId)) {
      throw new Error(`Component id already exists: '${componentId}'`);
    }

    const plugin = this.project.getPlugin(pluginId);

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
      delete this.data.bindings[binding.id];
      binding.rebuild();
      this.bindings.set(binding.id, binding);
      this.data.bindings[binding.id] = binding.data;
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

  getBinding(id: string) {
    const binding = this.bindings.get(id);
    if (!binding) {
      throw new Error(`Binding '${id}' does not exist`);
    }

    return binding;
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
}

export class Model extends ViewModel {
  private readonly instances = new Map<string, InstanceModel>();
  private readonly plugins = new Map<string, PluginModel>();
  private readonly templates = new Map<string, TemplateModel>();

  protected get project() {
    return this;
  }

  constructor(public readonly data: CoreProject) {
    super();

    for (const [id, pluginData] of Object.entries(data.plugins)) {
      this.registerPlugin(id, pluginData);
    }

    for (const [id, templateData] of Object.entries(data.templates)) {
      this.registerTemplate(id, templateData);
    }

    super.init();
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

  findPlugin(id: string) {
    return this.plugins.get(id);
  }

  getPlugin(id: string) {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Instance '${id}' does not exist`);
    }

    return plugin;
  }

  getTemplatesIds() {
    return Array.from(this.templates.keys());
  }

  hasTemplate(id: string) {
    return this.templates.has(id);
  }

  findTemplate(id: string) {
    return this.templates.get(id);
  }

  getTemplate(id: string) {
    const component = this.templates.get(id);
    if (!component) {
      throw new Error(`Template '${id}' does not exist`);
    }

    return component;
  }

  getTemplateOrSelf(templateId: string): ViewModel {
    return templateId ? this.getTemplate(templateId) : this;
  }

  private registerTemplate(id: string, templateData: CoreTemplate) {
    const template = new TemplateModel(this, id, templateData);

    this.templates.set(template.id, template);

    return template;
  }

  setTemplate(templateId: string) {
    if (this.hasTemplate(templateId)) {
      throw new Error(`Template id already exists: '${templateId}'`);
    }

    const templateData: CoreTemplate = {
      components: {},
      bindings: {},
      exports: {
        config: {},
        members: {}
      }
    };

    const template = this.registerTemplate(templateId, templateData);
    this.data.templates[template.id] = template.data;

    return template;
  }

  renameTemplate(id: string, newId: string) {
    if (this.hasTemplate(newId)) {
      throw new Error(`Template id already exists: '${newId}'`);
    }

    const template = this.templates.get(id);
    this.templates.delete(id);
    delete this.data.templates[id];

    template.rename(newId);

    this.templates.set(template.id, template);
    this.data.templates[template.id] = template.data;
  }

  clearTemplate(id: string) {
    const template = this.templates.get(id);

    for (const componentId of template.getComponentsIds()) {
      template.clearComponent(componentId);
    }

    for (const bindingId of template.getBindingsIds()) {
      template.clearBinding(bindingId);
    }

    this.templates.delete(template.id);
    delete this.data.templates[template.id];
  }

  // Note: impacts checks are already done
  importPlugin(instanceName: string, netPlugin: Plugin) {
    const pluginData: CorePluginData = {
      ...netPlugin,
      instanceName,
      toolboxDisplay: 'show'
    };

    const id = `${instanceName}:${netPlugin.module}.${netPlugin.name}`;
    const existing = this.findPlugin(id);
    if (existing) {
      // update its data
      existing.executeImport(pluginData);
      return existing;
    }

    const plugin = this.registerPlugin(id, pluginData);
    this.data.plugins[id] = plugin.data;

    return plugin;
  }

  // Note: impacts checks are already done
  importComponent(id: string, pluginId: string, external: boolean, config: { [id: string]: ConfigItem; }) {
    const existing = this.findComponent(id);

    if (existing) {
      // update its data
      const plugin = this.getPlugin(pluginId);
      existing.executeImport(plugin, { config, external });
      return existing;
    }

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

export class TemplateModel extends ViewModel {
  constructor(protected readonly project: Model, private _id: string, public readonly data: CoreTemplate) {
    super();
    this.init();
  }

  get id() {
    return this._id;
  }

  rename(newId: string) {
    this._id = newId;
  }

  setExport(exportType: 'config' | 'member', exportId: string, componentId: string, propertyName: string) {
    switch (exportType) {

    case 'config': 
      this.setConfigExport(exportId, componentId, propertyName);
      break;

    case 'member':
      this.setMemberExport(exportId, componentId, propertyName);
      break;

    default:
      throw new Error(`Invalid export type: '${exportType}'`);
    }
  }

  private setConfigExport(exportId: string, componentId: string, configName: string) {
    const component = this.getComponent(componentId);
    component.plugin.ensureConfig(configName);

    const exports = this.data.exports.config;
    exports[exportId] = { component: component.id, configName };
  }

  private setMemberExport(exportId: string, componentId: string, memberName: string) {
    const component = this.getComponent(componentId);
    component.plugin.ensureMember(memberName);

    const exports = this.data.exports.members;
    exports[exportId] = { component: component.id, member: memberName };
  }

  clearExport(exportType: 'config' | 'member', exportId: string) {
    switch (exportType) {
    case 'config': {
      const exports = this.data.exports.config;
      delete exports[exportId];
      break;
    }

    case 'member': {
      const exports = this.data.exports.members;
      delete exports[exportId];
      break;
    }

    default:
      throw new Error(`Invalid export type: '${exportType}'`);
    }
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

  hasNonExternalComponents() {
    for (const component of this.components.values()) {
      if (!component.data.external) {
        return true;
      }
    }

    return false;
  }

  hasComponent(id: string) {
    return this.components.has(id);
  }

  hasNonExternalComponent(id: string) {
    const component = this.components.get(id);
    return !!component && !component.data.external;
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

  executeImport(data: CorePluginData) {
    for (const prop of Object.keys(this.data)) {
      delete (this.data as any)[prop];
    }

    Object.assign(this.data, data);
  }

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

  ensureMember(name: string) {
    const member = this.data.members[name];
    if (!member) {
      throw new Error(`Member '${name}' does not exist on plugin '${this.id}'`);
    }
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

  private getConfigType(configId: string) {
    const item = this.data.config[configId];
    if (!item) {
      throw new Error(`Config '${configId}' does not exist on plugin '${this.id}'`);
    }

    return item.valueType;
  }

  ensureConfig(configId: string) {
    this.getConfigType(configId);
  }

  validateConfigValue(configId: string, configValue: any) {
    const valueType = this.getConfigType(configId);

    switch (valueType) {
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
  private _plugin: PluginModel;
  private _template: TemplateModel; // null if on project directly

  constructor(public readonly instance: InstanceModel, plugin: PluginModel, template: TemplateModel, private _id: string, public readonly data: CoreComponentData) {
    this._plugin = plugin;
    this._template = template;
  }

  executeImport(plugin: PluginModel, data: Omit<CoreComponentData, 'plugin' | 'position'>) {
    // keep its position
    const { position } = this.data;

    for (const prop of Object.keys(this.data)) {
      delete (this.data as any)[prop];
    }

    Object.assign(this.data, data, { position, plugin: plugin.id });
  }

  get id() {
    return this._id;
  }

  get plugin() {
    return this._plugin;
  }

  get template() {
    return this._template;
  }

  rename(newId: string) {
    this._id = newId;
  }

  move(delta: { x: number; y: number }) {
    this.data.position = {
      x: this.data.position.x + delta.x,
      y: this.data.position.y + delta.y,
    };
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
  private _template: TemplateModel; // null if on project directly

  constructor(template: TemplateModel, public readonly data: CoreBindingData, public readonly sourceComponent: ComponentModel, public readonly targetComponent: ComponentModel) {
    this._template = template;
    this.rebuild();
  }

  static makeId(data: CoreBindingData) {
    return `${data.sourceComponent}:${data.sourceState}:${data.targetComponent}:${data.targetAction}`;
  }

  rebuild() {
    this.data.sourceComponent = this.sourceComponent.id;
    this.data.targetComponent = this.targetComponent.id;
    this._id = BindingModel.makeId(this.data);
  }

  get id() {
    return this._id;
  }

  get template() {
    return this._template;
  }

  get sourceState() {
    return this.data.sourceState;
  }

  get targetAction() {
    return this.data.targetAction;
  }

}
