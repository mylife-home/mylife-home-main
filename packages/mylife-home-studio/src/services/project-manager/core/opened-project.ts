import { logger } from 'mylife-home-common';
import {
  ClearBindingCoreProjectCall,
  ClearComponentCoreProjectCall,
  ClearCoreBindingNotification,
  ClearCoreComponentNotification,
  ClearCorePluginNotification,
  ConfigureComponentCoreProjectCall,
  CoreBindingData,
  CoreComponentData,
  CorePluginData,
  CoreProject,
  CoreProjectCall,
  CoreToolboxDisplay,
  MoveComponentCoreProjectCall,
  ProjectCallResult,
  RenameComponentCoreProjectCall,
  RenameCoreComponentNotification,
  SetBindingCoreProjectCall,
  SetComponentCoreProjectCall,
  SetCoreBindingNotification,
  SetCoreComponentNotification,
  SetCorePluginsNotification,
  SetCorePluginToolboxDisplayNotification,
  UpdateToolboxCoreProjectCall,
} from '../../../../shared/project-manager';
import { ConfigType } from '../../../../shared/component-model';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { CoreProjects } from './projects';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:opened-project');

export class CoreOpenedProject extends OpenedProject {
  private readonly model: Model;

  constructor(private readonly owner: CoreProjects, name: string, private readonly project: CoreProject) {
    super('core', name);

    this.model = new Model(project);
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    notifier.notify({ operation: 'set-core-plugins', plugins: this.project.plugins } as SetCorePluginsNotification);

    for (const [id, component] of Object.entries(this.project.components)) {
      notifier.notify({ operation: 'set-core-component', id, component } as SetCoreComponentNotification);
    }

    for (const [id, binding] of Object.entries(this.project.bindings)) {
      notifier.notify({ operation: 'set-core-binding', id, binding } as SetCoreBindingNotification);
    }
  }

  async call(callData: CoreProjectCall): Promise<ProjectCallResult> {
    switch (callData.operation) {
      case 'update-toolbox':
        await this.updateToolbox(callData as UpdateToolboxCoreProjectCall);
        break;

      case 'set-component':
        await this.setComponent(callData as SetComponentCoreProjectCall);
        break;

      case 'move-component':
        await this.moveComponent(callData as MoveComponentCoreProjectCall);
        break;

      case 'configure-component':
        await this.configureComponent(callData as ConfigureComponentCoreProjectCall);
        break;

      case 'rename-component':
        await this.renameComponent(callData as RenameComponentCoreProjectCall);
        break;

      case 'clear-component':
        await this.clearComponent(callData as ClearComponentCoreProjectCall);
        break;

      case 'set-binding':
        await this.setBinding(callData as SetBindingCoreProjectCall);
        break;

      case 'clear-binding':
        await this.clearBinding(callData as ClearBindingCoreProjectCall);
        break;

      default:
        throw new Error(`Unhandled call: ${callData.operation}`);
    }

    // by default return nothing
    return null;
  }

  private async executeUpdate(updater: () => void) {
    await this.owner.update(this.name, updater);
  }

  private notifyAllSetPlugins() {
    this.notifyAll<SetCorePluginsNotification>({ operation: 'set-core-plugins', plugins: this.project.plugins });
  }

  private notifyAllSetPluginDisplay(id: string, display: CoreToolboxDisplay) {
    this.notifyAll<SetCorePluginToolboxDisplayNotification>({ operation: 'set-core-plugin-toolbox-display', id, display });
  }

  private notifyAllClearPlugin(id: string) {
    this.notifyAll<ClearCorePluginNotification>({ operation: 'clear-core-plugin', id });
  }

  private notifyAllSetComponent(id: string) {
    this.notifyAll<SetCoreComponentNotification>({ operation: 'set-core-component', id, component: this.project.components[id] });
  }

  private notifyAllClearComponent(id: string) {
    this.notifyAll<ClearCoreComponentNotification>({ operation: 'clear-core-component', id });
  }

  private notifyAllRenameComponent(id: string, newId: string) {
    this.notifyAll<RenameCoreComponentNotification>({ operation: 'rename-core-component', id, newId });
  }

  private notifyAllSetBinding(id: string) {
    this.notifyAll<SetCoreBindingNotification>({ operation: 'set-core-binding', id, binding: this.project.bindings[id] });
  }

  private notifyAllClearBinding(id: string) {
    this.notifyAll<ClearCoreBindingNotification>({ operation: 'clear-core-binding', id });
  }

  private async updateToolbox({ itemType, itemId, action }: UpdateToolboxCoreProjectCall) {
    await this.executeUpdate(() => {
      switch (itemType) {
        case 'instance':
          this.updateToolboxInstance(itemId, action);
          break;

        case 'plugin':
          this.updateToolboxPlugin(itemId, action);
          break;

        default:
          throw new Error(`Unknown item type: '${itemType}'`);
      }
    });
  }

  private updateToolboxInstance(id: string, action: 'show' | 'hide' | 'delete') {
    const instance = this.model.getInstance(id);
    switch (action) {
      case 'show':
      case 'hide': {
        const pluginIds = instance.updateAllPluginsDisplay(action);
        for (const pluginId of pluginIds) {
          this.notifyAllSetPluginDisplay(pluginId, action);
        }

        break;
      }

      case 'delete': {
        const pluginIds = instance.getAllUnusedPluginIds();
        for (const pluginId of pluginIds) {
          this.model.deletePlugin(pluginId);
          this.notifyAllClearPlugin(pluginId);
        }

        break;
      }

      default:
        throw new Error(`Unknown action: '${action}'`);
    }
  }

  private updateToolboxPlugin(id: string, action: 'show' | 'hide' | 'delete') {
    const plugin = this.model.getPlugin(id);
    switch (action) {
      case 'show':
      case 'hide':
        if (plugin.updateDisplay(action)) {
          this.notifyAllSetPluginDisplay(plugin.id, action);
        }

        break;

      case 'delete':
        if (plugin.used) {
          throw new Error(`Impossible de supprimer le plugin '${plugin.id}' car il est utilisé`);
        }

        this.model.deletePlugin(plugin.id);
        this.notifyAllClearPlugin(plugin.id);

        break;

      default:
        throw new Error(`Unknown action: '${action}'`);
    }
  }

  private async setComponent({ componentId, pluginId, x, y }: SetComponentCoreProjectCall) {
    await this.executeUpdate(() => {
      const component = this.model.setComponent(componentId, pluginId, x, y);
      this.notifyAllSetComponent(component.id);
    });
  }

  private async moveComponent({ componentId, x, y }: MoveComponentCoreProjectCall) {
    await this.executeUpdate(() => {
      const component = this.model.getComponent(componentId);
      component.move(x, y);
      this.notifyAllSetComponent(component.id);
    });
  }

  private async configureComponent({ componentId, configId, configValue }: ConfigureComponentCoreProjectCall) {
    await this.executeUpdate(() => {
      const component = this.model.getComponent(componentId);
      component.configure(configId, configValue);
      this.notifyAllSetComponent(component.id);
    });
  }

  private async renameComponent({ componentId, newId }: RenameComponentCoreProjectCall) {
    await this.executeUpdate(() => {
      this.model.renameComponent(componentId, newId);
      this.notifyAllRenameComponent(componentId, newId);
    });
  }

  private async clearComponent({ componentId }: ClearComponentCoreProjectCall) {
    await this.executeUpdate(() => {
      this.model.clearComponent(componentId);
      this.notifyAllClearComponent(componentId);
    });
  }

  private async setBinding({ binding }: SetBindingCoreProjectCall) {
    await this.executeUpdate(() => {
      throw new Error('TODO');
    });
  }

  private async clearBinding({ bindingId }: ClearBindingCoreProjectCall) {
    await this.executeUpdate(() => {
      this.model.clearBinding(bindingId);
      this.notifyAllClearBinding(bindingId);
    });
  }
}

class Model {
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

  getInstance(instanceName: string) {
    const instance = this.instances.get(instanceName);
    if (!instance) {
      throw new Error(`Instance '${instanceName}' does not exist`);
    }

    return instance;
  }

  getPlugin(id: string) {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Instance '${id}' does not exist`);
    }

    return plugin;
  }

  getComponent(id: string) {
    const component = this.components.get(id);
    if (!component) {
      throw new Error(`Instance '${id}' does not exist`);
    }

    return component;
  }

  setComponent(componentId: string, pluginId: string, x: number, y: number) {
    if (this.components.get(componentId)) {
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
    const component = this.components.get(id);
    if (this.components.get(newId)) {
      throw new Error(`Component id already exists: '${newId}'`);
    }

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

    // TODO: bindings
  }

  clearComponent(id: string) {
    const component = this.components.get(id);

    const plugin = component.plugin;
    const instance = component.instance;

    this.components.delete(component.id);
    plugin.unregisterComponent(component.id);
    instance.unregisterComponent(component.id);
  }

  setBinding(bindingData: CoreBindingData) {
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

class InstanceModel {
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

class PluginModel {
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
}

class ComponentModel {
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
    // TODO: validate
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

  getBindingsFrom() {
    return this.bindingsFrom;
  }

  getBindingsTo() {
    return this.bindingsTo;
  }
}

// Note: bindings have no update, then can only be created or deleted
class BindingModel {
  public readonly id: string;

  constructor(public readonly data: CoreBindingData, public readonly sourceComponent: ComponentModel, public readonly targetComponent: ComponentModel) {
    this.id = `${data.sourceComponent}:${data.sourceState}:${data.targetComponent}:${data.targetAction}`;
  }

  get sourceState() {
    return this.data.sourceState;
  }

  get targetAction() {
    return this.data.targetAction;
  }
}
