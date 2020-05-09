import { components, bus } from 'mylife-home-common';

class BusPlugin {
  constructor(private readonly plugin: components.metadata.Plugin, private readonly transport: bus.Transport) {}

  close() {}

  onOnlineChange(online: boolean) {}
}

class BusComponent {
  constructor(private readonly component: components.Component, private readonly transport: bus.Transport) {}

  close() {}

  onOnlineChange(online: boolean) {}
}

/**
 * Register on registry events to publish all local components on bus
 */
export class BusPublisher {
  private readonly busPlugins = new Map<components.metadata.Plugin, BusPlugin>();
  private readonly busComponents = new Map<components.Component, BusComponent>();

  constructor(private readonly registry: components.Registry, private readonly transport: bus.Transport) {
    this.registry.on('component.add', this.onComponentAdd);
    this.registry.on('component.remove', this.onComponentRemove);
    this.registry.on('plugin.add', this.onPluginAdd);
    this.registry.on('plugin.remove', this.onPluginRemove);
    this.transport.on('onlineChange', this.onOnlineChange);

    for (const plugin of this.registry.getPlugins(null)) {
      this.onPluginAdd(null, plugin);
    }
  }

  close() {
    this.registry.off('component.add', this.onComponentAdd);
    this.registry.off('component.remove', this.onComponentRemove);
    this.registry.off('plugin.add', this.onPluginAdd);
    this.registry.off('plugin.remove', this.onPluginRemove);
    this.transport.off('onlineChange', this.onOnlineChange);

    for (const component of Array.from(this.busComponents.keys())) {
      this.onComponentRemove(null, component);
    }

    for (const plugin of Array.from(this.busPlugins.keys())) {
      this.onPluginRemove(null, plugin);
    }
  }

  private readonly onOnlineChange = (online: boolean) => {
    // process plugins first, then components
    //  - on online : when a component is published, its plugin must already exist
    //  - on offline : we are offline so we don't care, let's do it in the same order
    for (const busPlugin of this.busPlugins.values()) {
      busPlugin.onOnlineChange(online);
    }

    for (const busComponent of this.busComponents.values()) {
      busComponent.onOnlineChange(online);
    }
  };

  private readonly onPluginAdd = (instanceName: string, plugin: components.metadata.Plugin) => {
    // only local plugins
    if (instanceName) {
      return;
    }

    const busPlugin = new BusPlugin(plugin, this.transport);
    this.busPlugins.set(plugin, busPlugin);
  };

  private readonly onPluginRemove = (instanceName: string, plugin: components.metadata.Plugin) => {
    // only local plugins
    if (instanceName) {
      return;
    }

    const busPlugin = this.busPlugins.get(plugin);
    busPlugin.close();
    this.busPlugins.delete(plugin);
  };

  private readonly onComponentAdd = (instanceName: string, component: components.Component) => {
    // only local components
    if (instanceName) {
      return;
    }

    const busComponent = new BusComponent(component, this.transport);
    this.busComponents.set(component, busComponent);
  };

  private readonly onComponentRemove = (instanceName: string, component: components.Component) => {
    // only local components
    if (instanceName) {
      return;
    }

    const busComponent = this.busComponents.get(component);
    busComponent.close();
    this.busComponents.delete(component);
  };
}
