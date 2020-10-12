import { bus, components, instanceInfo, tools } from 'mylife-home-common';
import { Store, BindingConfig } from '../store';
import { ComponentHost, metadata, Binding, BusPublisher } from '../components';
import { loadPlugins } from './plugin-loader';

export class ComponentManager {
  private readonly supportsBindings: boolean;
  private readonly registry: components.Registry;
  private readonly publisher: BusPublisher;
  private readonly store = new Store();
  private readonly components = new Map<string, ComponentHost>();
  private readonly bindings = new Map<string, Binding>();

  constructor(private readonly transport: bus.Transport) {
    this.supportsBindings = this.transport.presence.tracking;
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: this.supportsBindings });
    this.publisher = new BusPublisher(this.registry, transport);
  }

  async init() {
    instanceInfo.addCapability('components-manager');
    instanceInfo.addCapability('bindings-manager');

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
      this.bindings.set(this.buildBindingKey(config), new Binding(this.registry, config));
    }
  }

  async terminate() {
    for (const binding of this.bindings.values()) {
      binding.close();
    }
    this.bindings.clear();

    for (const component of this.components.values()) {
      this.registry.removeComponent(null, component);
      component.destroy();
    }
    this.components.clear();

    this.publisher.close();
    this.registry.close();
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

  getComponents() {
    return Array.from(this.store.getComponents());
  }

  addBinding(config: BindingConfig) {
    const key = this.buildBindingKey(config);
    if (this.bindings.get(key)) {
      throw new Error(`Binding already exists: ${JSON.stringify(config)}`);
    }

    this.bindings.set(this.buildBindingKey(config), new Binding(this.registry, config));
    this.store.addBinding(config);
  }

  removeBinding(config: BindingConfig) {
    const key = this.buildBindingKey(config);
    const binding = this.bindings.get(key);
    if (!binding) {
      throw new Error(`Binding does not exist: ${JSON.stringify(config)}`);
    }

    binding.close();
    this.bindings.delete(key);
    this.store.removeBinding(config);
  }

  getBindings() {
    return Array.from(this.store.getBindings());
  }

  async save() {
    await this.store.save();
  }

  private buildBindingKey(config: BindingConfig) {
    return [config.sourceId, config.sourceState, config.targetId, config.targetAction].join('|');
  }
}
