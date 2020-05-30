import os from 'os';
import { bus, components, buildInfo } from 'mylife-home-common';
import { loadPlugins } from './plugin-loader';

export class Manager {
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry

  constructor() {
    console.log(buildInfo.getInfo());

    // read-config
    const instanceName = os.hostname();
    this.transport = new bus.Transport(instanceName, "tcp://localhost", { presenceTracking: false });
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: false });
    
    loadPlugins(this.registry);
  }

  async terminate() {
    await this.transport.terminate();
  }
}