import { bus } from 'mylife-home-common';
import os from 'os';

export class Manager {
  private readonly transport: bus.Transport;

  constructor() {
    // read-config
    const instanceName = os.hostname();
    this.transport = new bus.Transport(instanceName, "tcp://localhost", { presenceTracking: false });
  }

  async terminate() {
    await this.transport.terminate();
  }
}