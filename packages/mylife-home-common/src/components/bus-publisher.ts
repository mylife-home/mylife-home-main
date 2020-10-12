import { EventEmitter } from 'events';
import { Registry, Component } from './registry';
import { Transport, RemoteMetadataView, RemoteComponent } from '../bus';
import { fireAsync } from '../tools';
import { Plugin, MemberType, NetComponent, NetPlugin, decodePlugin } from './metadata';

class BusComponent extends EventEmitter implements Component {
  readonly id: string;
  readonly plugin: Plugin;
  private readonly remoteComponent: RemoteComponent;
  private readonly states: { [name: string]: any; } = {};

  constructor(private readonly transport: Transport, private readonly registry: Registry, private readonly instanceName: string, netComponent: NetComponent) {
    super();

    this.id = netComponent.id;
    this.plugin = this.registry.getPlugin(this.instanceName, netComponent.plugin);

    this.remoteComponent = this.transport.components.trackRemoteComponent(this.instanceName, this.id);

    for (const [name, member] of Object.entries(this.plugin.members)) {
      if (member.memberType === MemberType.STATE) {
        this.states[name] = null;
        fireAsync(() => this.remoteComponent.registerStateChange(name, (value) => this.stateChange(name, value)));
      }
    }
  }

  close() {
    fireAsync(async () => {
      await this.transport.components.untrackRemoteComponent(this.remoteComponent);
    });
  }

  private stateChange(name: string, data: Buffer) {
    const member = this.plugin.members[name];
    const value = member.valueType.primitive.decode(data);
    this.states[name] = value;
    this.emit('state', name, value);
  }

  executeAction(name: string, value: any) {
    const member = this.plugin.members[name];
    if (!member || member.memberType !== MemberType.ACTION) {
      throw new Error(`Unknown action '${name}' on component '${this.id}' (plugin=${this.instanceName}:${this.plugin.module}.${this.plugin.name})`);
    }
    const type = member.valueType;
    type.validate(value);
    const data = type.primitive.encode(value);
    fireAsync(() => this.remoteComponent.emitAction(name, data));
  }

  getState(name: string) {
    const value = this.states[name];
    if (value === undefined) {
      throw new Error(`Unknown state '${name}' on component '${this.instanceName}:${this.id}' (plugin=${this.plugin.module}.${this.plugin.name})`);
    }

    return value;
  }

  getStates(): { [name: string]: any; } {
    return this.states;
  }
}

class BusInstance {
  private view: RemoteMetadataView;

  constructor(private readonly transport: Transport, private readonly registry: Registry, private readonly instanceName: string) {
    console.log('BUS INSTANCE CTOR', instanceName);
    fireAsync(async () => {
      this.view = await this.transport.metadata.createView(this.instanceName);
      this.view.on('set', (path, value) => this.set(path, value));
      this.view.on('clear', (path) => this.clear(path));

      // set first plugins then components
      const paths = sortPaths(this.view.paths);
      for (const path of paths.plugins) {
        this.set(path, this.view.getValue(path));
      }
      for (const path of paths.components) {
        this.set(path, this.view.getValue(path));
      }
    });
  }

  private set(path: string, value: any) {
    const [type, id] = path.split('/');
    switch (type) {
      case 'plugins': {
        // set semantic
        if (!this.registry.hasPlugin(this.instanceName, id)) {
          const netPlugin = value as NetPlugin;
          const plugin = decodePlugin(netPlugin);
          this.registry.addPlugin(this.instanceName, plugin);
        }
        break;
      }

      case 'components': {
        // set semantic
        if (!this.registry.hasComponent(id)) {
          const netComponent = value as NetComponent;
          const component = new BusComponent(this.transport, this.registry, this.instanceName, netComponent);
          this.registry.addComponent(this.instanceName, component);
        }
        break;
      }
    }
  }

  private clear(path: string) {
    const [type, id] = path.split('/');
    switch (type) {
      case 'plugins':
        const plugin = this.registry.getPlugin(this.instanceName, id);
        this.registry.removePlugin(this.instanceName, plugin);
        break;

      case 'components':
        const component = this.registry.getComponent(id);
        this.registry.removeComponent(this.instanceName, component);
        (component as BusComponent).close();
        break;
    }
  }

  close() {
    for (const { instanceName, component } of this.registry.getComponentsData()) {
      if (instanceName != this.instanceName) {
        continue;
      }

      this.registry.removeComponent(this.instanceName, component);
      (component as BusComponent).close();
    }

    for (const plugin of this.registry.getPlugins(this.instanceName)) {
      this.registry.removePlugin(this.instanceName, plugin);
    }

    fireAsync(async () => {
      await this.transport.metadata.closeView(this.view);
    });
  }
}

export class BusPublisher {
  private readonly instances = new Map<string, BusInstance>();

  constructor(private readonly transport: Transport, private readonly registry: Registry) {
    if (!transport.presence.tracking) {
      throw new Error(`Cannot use 'BusPublisher' with presence tracking disabled`);
    }

    this.transport.presence.on('instanceChange', this.onInstanceChange);
  }

  close() {
    this.transport.presence.off('instanceChange', this.onInstanceChange);
  }

  private readonly onInstanceChange = (instanceName: string, online: boolean) => {
    if (online) {
      const instance = new BusInstance(this.transport, this.registry, instanceName);
      this.instances.set(instanceName, instance);
      return;
    }

    const instance = this.instances.get(instanceName);
    instance.close();
    this.instances.delete(instanceName);
  };
}

function sortPaths(paths: Iterable<string>) {
  const plugins = [];
  const components = [];

  for(const path of paths) {
    const [type] = path.split('/');
    switch(type) {
      case 'plugins':
        plugins.push(path);
        break;

      case 'components':
        components.push(path);
        break;
    }
  }

  return { plugins, components };
}