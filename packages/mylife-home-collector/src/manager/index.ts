import { bus, instanceInfo } from 'mylife-home-common';
import { Logging } from './logging';
import { History } from './history';

export class Manager {
  private readonly transport: bus.Transport;
  private readonly logging: Logging;
  private readonly history: History;

  constructor() {
    this.transport = new bus.Transport({ presenceTracking: true });
    this.logging = new Logging(this.transport);
    this.history = new History(this.transport);
  }

  async init() {
    await this.logging.init();
    await this.history.init();

    instanceInfo.addCapability('collector-manager');
  }

  async terminate() {
    await this.logging.terminate();
    await this.history.terminate();
    await this.transport.terminate();
  }
}
