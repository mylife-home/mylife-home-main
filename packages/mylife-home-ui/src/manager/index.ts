import { bus, components } from 'mylife-home-common';
import { WebServer } from '../web';
import { SessionsManager } from '../sessions';
import { ModelManager } from '../model';

export class Manager {
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry;
  private readonly sessionsManager: SessionsManager;
  private readonly model: ModelManager;
  private readonly webServer: WebServer;

  constructor() {
    this.transport = new bus.Transport({ presenceTracking: true });
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: true });
    this.model = new ModelManager();
    this.sessionsManager = new SessionsManager(this.registry, this.model);
    this.webServer = new WebServer(this.registry, this.model);
    this.webServer.on('io.connection', socket => this.sessionsManager.addClient(socket));
  }

  async init() {}

  async terminate() {
    await this.webServer.terminate();
    await this.sessionsManager.terminate();
    await this.transport.terminate();
  }
}
