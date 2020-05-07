import { EventEmitter } from 'events';
import { Plugin } from './metadata';
import { BusPublisher } from './bus-publisher';
import { Transport } from '../bus';

export interface Component extends EventEmitter {
  on(event: 'state', listener: (name: string, value: any) => void): this;
  off(event: 'state', listener: (name: string, value: any) => void): this;
  once(event: 'state', listener: (name: string, value: any) => void): this;

  readonly id: string;
  readonly plugin: Plugin;

  executeAction(name: string, value: any): void;
  getState(name: string): any;
  getStates(): { [name: string]: any; };
}

export interface Registry extends EventEmitter {
  on(event: 'component.add', listener: (instanceName: string, component: Component) => void): this;
  off(event: 'component.add', listener: (instanceName: string, component: Component) => void): this;
  once(event: 'component.add', listener: (instanceName: string, component: Component) => void): this;

  on(event: 'component.remove', listener: (instanceName: string, component: Component) => void): this;
  off(event: 'component.remove', listener: (instanceName: string, component: Component) => void): this;
  once(event: 'component.remove', listener: (instanceName: string, component: Component) => void): this;

  on(event: 'plugin.add', listener: (instanceName: string, plugin: Plugin) => void): this;
  off(event: 'plugin.add', listener: (instanceName: string, plugin: Plugin) => void): this;
  once(event: 'plugin.add', listener: (instanceName: string, plugin: Plugin) => void): this;

  on(event: 'plugin.remove', listener: (instanceName: string, plugin: Plugin) => void): this;
  off(event: 'plugin.remove', listener: (instanceName: string, plugin: Plugin) => void): this;
  once(event: 'plugin.remove', listener: (instanceName: string, plugin: Plugin) => void): this;
}

export interface RegistryOptions {
  readonly transport?: Transport;
  readonly publishRemoteComponent?: boolean;
}

interface InstanceData {
  readonly plugins: Set<Plugin>;
  readonly components: Set<Component>;
}

export class Registry extends EventEmitter implements Registry {
  private readonly components = new Map<string, Component>();
  private readonly plugins = new Map<string, Plugin>();
  private readonly instances = new Map<string, InstanceData>();
  private readonly publisher: BusPublisher;

  constructor(options: RegistryOptions = {}) {
    super();

    if (options.publishRemoteComponent) {
      this.publisher = new BusPublisher(options.transport, this);
    }
  }

  close() {
    if (this.publisher) {
      this.publisher.close();
    }
  }

  get publishingRemoteComponents() {
    return !!this.publisher;
  }

  private updateInstance(instanceName: string, callback: (instanceData: InstanceData) => void) {
    let instanceData = this.instances.get(instanceName);
    if (!instanceData) {
      instanceData = { plugins: new Set<Plugin>(), components: new Set<Component>() };
      this.instances.set(instanceName, instanceData);
    }

    callback(instanceData);

    if (!instanceData.plugins.size && !instanceData.components.size) {
      this.instances.delete(instanceName);
    }
  }

  addPlugin(instanceName: string, plugin: Plugin) {
    const key = this.buildPluginId(instanceName, plugin);
    if (this.plugins.get(key)) {
      throw new Error(`Plugin ${key} does already exist in the registry`);
    }

    this.plugins.set(key, plugin);
    this.updateInstance(instanceName, ({ plugins }) => plugins.add(plugin));

    this.emit('plugin.add', instanceName, plugin);
  }

  removePlugin(instanceName: string, plugin: Plugin) {
    const key = this.buildPluginId(instanceName, plugin);
    if (!this.plugins.get(key)) {
      throw new Error(`Plugin ${key} does not exist in the registry`);
    }

    this.plugins.delete(key);
    this.updateInstance(instanceName, ({ plugins }) => plugins.delete(plugin));

    this.emit('plugin.remove', instanceName, plugin);
  }

  getPlugin(instanceName: string, id: string) {
    const key = `${instanceName || 'local'}:${id}`;
    const plugin = this.plugins.get(key);
    if (!plugin) {
      throw new Error(`Plugin ${key} does not exist in the registry`);
    }
    return plugin;
  }

  getPlugins(instanceName: string): Set<Plugin> {
    const instanceData = this.instances.get(instanceName);
    return instanceData ? instanceData.plugins : new Set<Plugin>();
  }

  private buildPluginId(instanceName: string, plugin: Plugin) {
    return `${instanceName || 'local'}:${plugin.module}.${plugin.name}`;
  }

  addComponent(instanceName: string, component: Component) {
    const id = this.buildComponentId(instanceName, component);
    if (this.components.get(id)) {
      throw new Error(`Component ${id} does already exist in the registry`);
    }

    this.components.set(id, component);
    this.updateInstance(instanceName, ({ components }) => components.add(component));

    this.emit('component.add', instanceName, component);
  }

  removeComponent(instanceName: string, component: Component) {
    const id = this.buildComponentId(instanceName, component);
    if (!this.components.get(id)) {
      throw new Error(`Component ${id} does not exist in the registry`);
    }

    this.components.delete(id);
    this.updateInstance(instanceName, ({ components }) => components.delete(component));

    this.emit('component.remove', instanceName, component);
  }

  getComponent(instanceName: string, id: string) {
    const key = `${instanceName || 'local'}:${id}`;
    const component = this.components.get(key);
    if (!component) {
      throw new Error(`Component ${key} does not exist in the registry`);
    }
    return component;
  }

  getComponents(instanceName: string): Set<Component> {
    const instanceData = this.instances.get(instanceName);
    return instanceData ? instanceData.components : new Set<Component>();
  }

  private buildComponentId(instanceName: string, component: Component) {
    return `${instanceName || 'local'}:${component.id}`;
  }
}
