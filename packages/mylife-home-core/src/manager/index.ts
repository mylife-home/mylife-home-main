import os from 'os';
import { bus, components, tools } from 'mylife-home-common';
import { loadPlugins } from './plugin-loader';

interface Config {
  readonly serverUrl: string;
  readonly listenRemote: boolean;
}

export class Manager {
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry

  constructor() {
    const config = tools.getConfig() as Config;
    const instanceName = os.hostname();
    this.transport = new bus.Transport(instanceName, config.serverUrl, { presenceTracking: config.listenRemote });
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: config.listenRemote });
    
    loadPlugins(this.registry);
  }

  async terminate() {
    await this.transport.terminate();
  }
}