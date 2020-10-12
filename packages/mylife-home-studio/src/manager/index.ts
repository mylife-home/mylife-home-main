import { bus, instanceInfo } from 'mylife-home-common';
import { WebServer } from '../web';
import { Services } from '../services';

export class Manager {
  private readonly transport: bus.Transport;
  private readonly webServer: WebServer;
  private readonly services: Services;

  constructor() {
    this.transport = new bus.Transport({ presenceTracking: true });
    this.webServer = new WebServer();
    this.services = new Services({ transport: this.transport, httpServer: this.webServer.httpServer });
  }

  async init() {
    await this.services.init();

    instanceInfo.addCapability('studio-manager');
  }

  async terminate() {
    await this.services.terminate();
    await this.webServer.terminate();
    await this.transport.terminate();
  }
}
