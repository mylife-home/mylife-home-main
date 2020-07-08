import { bus, components } from 'mylife-home-common';
import WebServer from '../web/server';
import { SessionsManager } from './sessions-manager';

export class Manager {
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry;
  private readonly sessionsManager: SessionsManager;
  private readonly webServer: WebServer;

  constructor() {
    this.transport = new bus.Transport({ presenceTracking: true });
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: true });
    this.sessionsManager = new SessionsManager(this.registry);
    this.webServer = new WebServer(this.registry, (socket) => this.sessionsManager.addClient(socket));
  }

  async init() {}

  async terminate() {
    await this.webServer.close();
    await this.sessionsManager.terminate();
    await this.transport.terminate();
  }
}
