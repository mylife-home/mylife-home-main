import os from 'os';
import { bus, components, tools } from 'mylife-home-common';
import { loadPlugins } from './plugin-loader';

export class Manager {
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry

  constructor() {
    const listenRemote = tools.getConfigItem<boolean>('listenRemote');
    this.transport = new bus.Transport({ presenceTracking: listenRemote });
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: listenRemote });
    
    loadPlugins(this.registry);
  }

  async terminate() {
    await this.transport.terminate();
  }
}