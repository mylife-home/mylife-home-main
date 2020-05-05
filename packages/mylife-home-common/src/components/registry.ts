import { EventEmitter } from 'events';
import { Plugin } from './metadata';

export interface Component extends EventEmitter {
  on(event: 'state', listener: (name: string, value: any) => void): this;
  off(event: 'state', listener: (name: string, value: any) => void): this;
  once(event: 'state', listener: (name: string, value: any) => void): this;

  readonly instanceName: string; // or null for local
  readonly id: string;
  readonly plugin: Plugin;

  executeAction(name: string, value: any): void;
  getState(name: string): any;
  getStates(): { [name: string]: any; };
}

class InstancePlugin {
  constructor(public readonly instanceName: string, public readonly plugin: Plugin) {
  }
}

export interface Registry extends EventEmitter {
  on(event: 'add', listener: (component: Component) => void): this;
  off(event: 'add', listener: (component: Component) => void): this;
  once(event: 'add', listener: (component: Component) => void): this;

  on(event: 'remove', listener: (component: Component) => void): this;
  off(event: 'remove', listener: (component: Component) => void): this;
  once(event: 'remove', listener: (component: Component) => void): this;
}

export class Registry extends EventEmitter implements Registry {
  private readonly components = new Set<Component>();
  private readonly plugins = new Set<InstancePlugin>();

  addPlugin(plugin: InstancePlugin) {
    if (this.plugins.has(plugin)) {
      throw new Error(`Plugin ${buildPluginId(plugin)} does already exist in the registry`);
    }
    this.plugins.add(plugin);
    this.emit('plugin.add', plugin);
  }

  removePlugin(plugin: InstancePlugin) {
    if (!this.plugins.has(plugin)) {
      throw new Error(`Plugin ${buildPluginId(plugin)} does not exist in the registry`);
    }
    this.plugins.delete(plugin);
    this.emit('plugin.remove', plugin);
  }

  addComponent(component: Component) {
    if (this.components.has(component)) {
      throw new Error(`Component ${buildComponentId(component)} does already exist in the registry`);
    }
    this.components.add(component);
    this.emit('component.add', component);
  }

  removeComponent(component: Component) {
    if (!this.components.has(component)) {
      throw new Error(`Component ${buildComponentId(component)} does not exist in the registry`);
    }
    this.components.delete(component);
    this.emit('component.remove', component);
  }
}

function buildPluginId(plugin: InstancePlugin) {
  return `${plugin.instanceName || 'local'}:${plugin.plugin.module}.${plugin.plugin.name}`;
}

function buildComponentId(component: Component) {
  return `${component.instanceName || 'local'}:${component.id}`;
}