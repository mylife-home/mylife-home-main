import EventEmitter from 'events';
import { Registry, Component } from './registry';
import { Transport, RemoteMetadataView } from '../bus';
import { fireAsync } from '../tools';

class BusComponent extends EventEmitter implements Component {
  constructor() {
    super();
  }

  id: string;
  plugin: import("./metadata").Plugin;

  close() {

  }
}

class BusInstance {
  private view: RemoteMetadataView;

  constructor(private readonly transport: Transport, private readonly registry: Registry, private readonly instanceName: string) {
    fireAsync(async () => {
      this.view = await this.transport.metadata.createView(this.instanceName);
      this.view.on('set', (path, value) => this.set(path, value));
      this.view.on('clear', (path) => this.clear(path));

      for (const path of this.view.paths) {
        this.set(path, this.view.getValue(path));
      }
    });
  }

  private set(path: string, value: any) {
    const [type, id] = path.split('/');
    switch (type) {
      case 'plugins':
        this.registry.addPlugin(this.instanceName, value as Plugin);
        break;

      case 'components':
        const component = new BusComponent();
        this.registry.addComponent(this.instanceName, component);
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
        const component = this.registry.getComponent(this.instanceName, id) as BusComponent;
        this.registry.removeComponent(this.instanceName, component);
        component.close();
        break;
    }
  }

  close() {
    for (const component as BusComponent of this.registry.getComponents(this.instanceName)) {
      this.registry.removeComponent(this.instanceName, component);
      component.close();
    }

    for (const plugin of this.registry.getPlugins(this.instanceName)) {
      this.registry.removePlugin(this.instanceName, component);
    }

    fireAsync(async () => {
      await this.transport.metadata.closeView(this.view);
    });
  }
}

export class BusPublisher {
  private readonly onInstanceChange = (instanceName: string, online: boolean) => this.instanceChange(instanceName, online);

  private readonly instances = new Map<string, BusInstance>();

  constructor(private readonly transport: Transport, private readonly registry: Registry) {
    this.transport.presence.on('instanceChange', this.onInstanceChange);
  }

  close() {
    this.transport.presence.off('instanceChange', this.onInstanceChange);
  }

  private instanceChange(instanceName: string, online: boolean) {
    if (online) {
      const instance = new BusInstance(this.transport, this.registry, instanceName);
      this.instances.set(instanceName, instance);
      return;
    }

    const instance = this.instances.get(instanceName);
    instance.close();
    this.instances.delete(instanceName);
  }
}