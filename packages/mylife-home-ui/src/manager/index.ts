import { bus, components, instanceInfo } from 'mylife-home-common';
import { WebServer } from '../web';
import { SessionsManager } from '../sessions';
import { Definition, ModelManager } from '../model';

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
    this.webServer = new WebServer(this.registry, this.model);
    this.sessionsManager = new SessionsManager(this.registry, this.model, this.webServer.httpServer);
  }

  async init() {
    await this.transport.rpc.serve('definition.set', async (definition: Definition) => this.model.setDefinition(definition));

    instanceInfo.addCapability('ui-manager');
  }

  async terminate() {
    await this.webServer.terminate();
    await this.sessionsManager.terminate();
    await this.transport.terminate();
  }
}
