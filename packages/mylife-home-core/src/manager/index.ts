import { bus, components, tools } from 'mylife-home-common';
import { Store } from '../store';
import { ComponentHost, metadata, Binding } from '../components';
import { loadPlugins } from './plugin-loader';

export class Manager {
  private readonly supportsBindings: boolean;
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry;
  private readonly store = new Store();
  private readonly components = new Map<string, ComponentHost>();
  private readonly bindings = new Set<Binding>();

  constructor() {
    this.supportsBindings = tools.getConfigItem<boolean>('supportsBindings', true) || false;
    this.transport = new bus.Transport({ presenceTracking: this.supportsBindings });
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: this.supportsBindings });
  }

  async init() {
    loadPlugins(this.registry);

    await this.store.load();

    if (this.supportsBindings && this.store.hasBindings()) {
      throw new Error('Store has binding but configuration does not activate its support');
    }

    for (const config of this.store.getComponents()) {
      const plugin = this.registry.getPlugin(null, config.plugin) as metadata.LocalPlugin;
      const component = new ComponentHost(config.id, plugin, config.config);
      this.components.set(component.id, component);
      this.registry.addComponent(null, component);
    }

    for (const config of this.store.getBindings()) {
      this.bindings.add(new Binding(this.registry, config));
    }
  }

  async terminate() {
    for (const binding of this.bindings) {
      binding.close();
    }
    this.bindings.clear();

    for (const component of this.components.values()) {
      this.registry.removeComponent(null, component);
      component.destroy();
    }
    this.components.clear();

    await this.transport.terminate();
  }

  addComponent(id: string, plugin: string, config: { [name: string]: any }) {
    if (this.components.get(id)) {
      throw new Error(`Component id duplicate: '${id}'`);
    }

    const pluginInstance = this.registry.getPlugin(null, plugin) as metadata.LocalPlugin;
    const component = new ComponentHost(id, pluginInstance, config);
    this.components.set(component.id, component);
    this.registry.addComponent(null, component);
    this.store.setComponent({ id, plugin, config });
  }

  removeComponent(id: string) {
    const component = this.components.get(id);
    if (!component) {
      throw new Error(`Component id does not exist: '${id}'`);
    }

    this.registry.removeComponent(null, component);
    component.destroy();
    this.components.delete(id);
    this.store.removeComponent(id);
  }
}
