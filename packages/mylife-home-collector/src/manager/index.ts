import { bus, instanceInfo } from 'mylife-home-common';

export class Manager {
  private readonly transport: bus.Transport;
  //private readonly services: Services;

  constructor() {
    this.transport = new bus.Transport({ presenceTracking: true });
    //this.services = new Services({ transport: this.transport, httpServer: this.webServer.httpServer });
  }

  async init() {
    //await this.services.init();

    instanceInfo.addCapability('collector-manager');
  }

  async terminate() {
    //await this.services.terminate();
    await this.transport.terminate();
  }
}
