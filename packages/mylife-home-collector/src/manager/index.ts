import { bus, instanceInfo } from 'mylife-home-common';
import { Logging } from './logging';

export class Manager {
  private readonly transport: bus.Transport;
  private readonly logging: Logging;

  constructor() {
    this.transport = new bus.Transport({ presenceTracking: true });
    this.logging = new Logging(this.transport);
  }

  async init() {
    await this.logging.init();

    instanceInfo.addCapability('collector-manager');
  }

  async terminate() {
    await this.logging.terminate();
    await this.transport.terminate();
  }
}
