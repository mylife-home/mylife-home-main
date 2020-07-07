import { EventEmitter } from 'events';
import io from 'socket.io';
import { bus, tools, components, logger } from 'mylife-home-common';
import WebServer from '../web/server';

const log = logger.createLogger('mylife:home:ui:manager');

class Session extends EventEmitter {
  private readonly stateListeners = new Map<string, (name: string, value: any) => void>();

  constructor(private readonly socket: io.Socket, private readonly registry: components.Registry) {
    super();

    log.debug(`New session '${socket.id}' from '${socket.conn.remoteAddress}'`);

    this.socket.on('disconnect', this.onClose);
    this.socket.on('action', (data) => this.executeAction(data.id, data.name));

    this.registry.on('component.add', this.onComponentAdd);
    this.registry.on('component.remove', this.onComponentRemove);

    const data: { [id: string]: { [id: string]: any } } = {};
    for (const component of this.registry.getComponents()) {
      if (component.plugin.usage !== components.metadata.PluginUsage.UI) {
        continue;
      }

      this.startListenChanges(component);
      data[component.id] = component.getStates();
    }
    this.socket.emit('state', data);
  }

  private readonly onClose = () => {
    this.registry.off('component.add', this.onComponentAdd);
    this.registry.off('component.remove', this.onComponentRemove);

    log.debug(`Session closed '${this.socket.id}'`);
    this.emit('close');
  };

  private startListenChanges(component: components.Component) {
    const { id } = component;
    const listener = (name: string, value: any) => this.socket.emit('change', { id, name, value });
    component.on('state', listener);
    this.stateListeners.set(id, listener);
  }

  private stopListenChanges(component: components.Component) {
    const { id } = component;
    const listener = this.stateListeners.get(id);
    component.off('state', listener);
    this.stateListeners.delete(id);
  }

  private readonly onComponentAdd = (instanceName: string, component: components.Component) => {
    if (component.plugin.usage !== components.metadata.PluginUsage.UI) {
      return;
    }

    this.startListenChanges(component);
    this.socket.emit('add', { id: component.id, attributes: component.getStates() });
  };

  private readonly onComponentRemove = (instanceName: string, component: components.Component) => {
    if (component.plugin.usage !== components.metadata.PluginUsage.UI) {
      return;
    }

    this.stopListenChanges(component);
    this.socket.emit('remove', { id: component.id });
  };

  private executeAction(componentId: string, actionName: string) {
    const component = this.registry.findComponent(componentId);
    if (!component) {
      log.info(`executeAction: component '${componentId}' not found`);
      return;
    }

    component.executeAction(actionName, true);
    component.executeAction(actionName, false);
  }

  async kill() {
    await new Promise((resolve) => {
      this.once('close', resolve);
      this.socket.disconnect();
    });
  }
}

export class Manager {
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry;

  private readonly sessions = new Map<string, Session>();
  private idGenerator = 0;
  private readonly webServer: WebServer;

  constructor() {
    this.transport = new bus.Transport({ presenceTracking: true });
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: true });

    type NetConfig = { host: string; port: number };
    type WebConfig = { port: number; staticDirectory: string };
    const netConfig = tools.getConfigItem<NetConfig>('net');
    const webConfig = tools.getConfigItem<WebConfig>('web');

    this.webServer = new WebServer(this.registry, (socket) => this.createSession(socket), webConfig);
  }

  async init() {}

  private createSession(socket: io.Socket) {
    const id = (++this.idGenerator).toString();
    const session = new Session(socket, this.registry);
    this.sessions.set(id, session);
    session.on('close', () => this.sessions.delete(id));
  }

  async terminate() {
    await this.webServer.close();
    await Promise.all(Array.from(this.sessions.values()).map((session) => session.kill()));
    await this.transport.terminate();
  }
}
