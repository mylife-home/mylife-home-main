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
      case 'hide':
        const pluginIds = instance.updateAllPluginsDisplay(action);
        for (const pluginId of pluginIds) {
          this.notifyAllSetPluginDisplay(pluginId, action);
        }
        break;

      case 'delete':
        throw new Error('TODO');

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
        throw new Error('TODO');

      default:
        throw new Error(`Unknown action: '${action}'`);
    }
  }

  private async setComponent({ componentId, pluginId, x, y }: SetComponentCoreProjectCall) {
    await this.executeUpdate(() => {
      throw new Error('TODO');
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

  private async clearComponent({ componentId}: ClearComponentCoreProjectCall) {
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
      this.registerBinding(id, bindingData);
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

  private registerComponent(id: string, componentData: CoreComponentData) {
    const plugin = this.getPlugin(componentData.plugin);
    const { instance } = plugin;
    const component = new ComponentModel(instance, plugin, id, componentData);

    this.components.set(component.id, component);
    plugin.registerComponent(component);
    instance.registerComponent(component);
  }

  private registerBinding(id: string, bindingData: CoreBindingData) {
    // TODO
  }

  getInstance(instanceName: string) {
    return this.instances.get(instanceName);
  }

  getPlugin(id: string) {
    return this.plugins.get(id);
  }

  getComponent(id: string) {
    return this.components.get(id);
  }

  setComponent() {
    throw new Error('TODO');
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

    component.rename(newId);

    this.components.set(component.id, component);
    plugin.registerComponent(component);
    instance.registerComponent(component);
  }

  clearComponent(id: string) {
    const component = this.components.get(id);

    const plugin = component.plugin;
    const instance = component.instance;

    this.components.delete(component.id);
    plugin.unregisterComponent(component.id);
    instance.unregisterComponent(component.id);
  }

  setBinding() {
    throw new Error('TODO');
  }

  clearBinding(id: string) {
    throw new Error('TODO');
  }
}

class InstanceModel {
  public readonly components = new Map<string, ComponentModel>();
  public readonly plugins = new Map<string, PluginModel>();

  constructor(public readonly instanceName: string) {}

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

  get used() {
    return this.components.size > 0;
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
}

class PluginModel {
  public readonly components = new Map<string, ComponentModel>();

  constructor(public readonly instance: InstanceModel, private _id: string, public readonly data: CorePluginData) {}

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
}

class ComponentModel {
  constructor(public readonly instance: InstanceModel, public readonly plugin: PluginModel, private _id: string, public readonly data: CoreComponentData) {}

  get id() {
    return this._id;
  }

  rename(newId: string) {
    this._id = newId;
  }

  move(x: number, y: number) {
    this.data.position = { x, y};
  }

  configure(configId: string, configValue: any) {
    // TODO: validate
    this.data.config[configId] = configValue;
  }
}

class BindingModel {}
