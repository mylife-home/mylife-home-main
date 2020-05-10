import { components, bus, tools } from 'mylife-home-common';

interface MetaWithId {
  readonly id: string;
}

class BusMeta {
  private readonly path: string;

  constructor(metaType: string, id: string, private readonly meta: any, protected readonly transport: bus.Transport) {
    this.path = `${metaType}/${id}`;
  }

  protected publishMeta() {
    tools.fireAsync(() => this.transport.metadata.set(this.path, this.meta));
  }

  protected unpublishMeta() {
    tools.fireAsync(() => this.transport.metadata.clear(this.path));
  }
}

class BusPlugin extends BusMeta {
  constructor(plugin: components.metadata.Plugin, transport: bus.Transport) {
    super('plugins', plugin.id, components.metadata.encodePlugin(plugin), transport);

    if (this.transport.online) {
      this.onOnlineChange(true);
    }
  }

  close() {
    this.unpublishMeta();
  }

  onOnlineChange(online: boolean) {
    if (online) {
      this.publishMeta();
    }
  }
}

class BusComponent extends BusMeta {
  private transportComponent: bus.LocalComponent;

  constructor(private readonly component: components.Component, transport: bus.Transport) {
    super('components', component.id, buildNetComponent(component), transport);

    this.component.on('state', this.onStateChange);

    if (this.transport.online) {
      this.onOnlineChange(true);
    }
  }

  close() {
    this.unpublishMeta();

    this.component.off('state', this.onStateChange);

    if (this.transport.online) {
      this.onOnlineChange(false);
    }
  }

  onOnlineChange(online: boolean) {
    if (online) {
      tools.fireAsync(this.setOnline);
    } else {
      tools.fireAsync(this.setOffline);
    }
  }

  private readonly setOnline = async () => {
    this.transportComponent = this.transport.components.addLocalComponent(this.component.id);

    for (const [name, member] of Object.entries(this.component.plugin.members)) {
      switch (member.memberType) {
        case components.metadata.MemberType.ACTION:
          {
            await this.transportComponent.registerAction(name, (data: Buffer) => {
              const value = member.valueType.primitive.decode(data);
              this.component.executeAction(name, value);
            });
          }
          break;

        case components.metadata.MemberType.STATE:
          {
            const value = this.component.getState(name);
            this.onStateChange(name, value);
          }
          break;
      }
    }

    this.publishMeta();
  };

  private readonly onStateChange = (name: string, value: any) => {
    if (!this.transport.online) {
      return;
    }

    const member = this.component.plugin.members[name];
    const data = member.valueType.primitive.encode(value);
    tools.fireAsync(() => this.transportComponent.setState(name, data));
  };

  private readonly setOffline = async () => {
    this.transportComponent = null;
    await this.transport.components.removeLocalComponent(this.component.id);

    // no need to unpublish meta offline
  };
}

function buildNetComponent(component: components.Component): components.metadata.NetComponent {
  return { id: component.id, plugin: component.plugin.id };
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
