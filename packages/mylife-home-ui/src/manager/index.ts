import { EventEmitter } from 'events';
import async from 'async';
import io from 'socket.io';
import { bus, tools, components, logger } from 'mylife-home-common';
import * as net from '../net';
import WebServer from '../web/server';

const log = logger.createLogger('mylife:home:ui:manager');

class Session extends EventEmitter {
  constructor(private readonly socket: io.Socket, private readonly netRepository: net.Repository, private readonly registry: components.Registry) {
    super();

    log.debug(`New session '${socket.id}' from '${socket.conn.remoteAddress}'`);

    this.socket.on('disconnect', () => {
      log.debug(`Session closed '${socket.id}'`);
      this.emit('close');
    });

    this.socket.on('action', (data) => this.executeAction(data.id, data.name));

    this.netRepository.on('add', (id: string, obj: net.RemoteObject) => this.socket.emit('add', { id: id, attributes: this.objAttributes(obj) }));
    this.netRepository.on('remove', (id: string) => this.socket.emit('remove', { id: id }));
    this.netRepository.on('change', (id: string, name: string, value: string) => this.socket.emit('change', { id: id, name: name, value: value }));

    this.sendState();
  }

  private executeAction(componentId: string, actionName: string) {
    // FIXME: no name transform
    componentId = componentId.replace(/_/g, '-');

    const component = this.registry.findComponent(componentId);
    if (!component) {
      log.info(`executeAction: component '${componentId}' not found`);
      return;
    }

    component.executeAction(actionName, true);
    component.executeAction(actionName, false);
  }

  private objAttributes(obj: net.RemoteObject) {
    const attrs: { [id: string]: string; } = {};
    for (const name of obj.attributes) {
      attrs[name] = obj.attribute(name);
    }
    return attrs;
  }

  private sendState() {
    const data: { [id: string]: { [id: string]: string; }; } = {};
    for (const id of this.netRepository.objects) {
      const obj = this.netRepository.object(id);
      data[id] = this.objAttributes(obj);
    }
    this.socket.emit('state', data);
  }

  kill(cb: (err?: Error) => void) {
    this.once('close', cb);
    this.socket.disconnect();
  }
}

export class Manager {
  private readonly transport: bus.Transport;
  private readonly registry: components.Registry;

  private readonly sessions = new Map<string, Session>();
  private idGenerator = 0;
  private readonly netAgent: net.Client;
  private readonly netRepository: net.Repository;
  private readonly webServer: WebServer;

  constructor() {
    this.transport = new bus.Transport({ presenceTracking: true });
    this.registry = new components.Registry({ transport: this.transport, publishRemoteComponents: true });

    type NetConfig = { host: string; port: number; };
    type WebConfig = { port: number; staticDirectory: string; };
    const netConfig = tools.getConfigItem<NetConfig>('net');
    const webConfig = tools.getConfigItem<WebConfig>('web');

    this.netAgent = new net.Client(netConfig, 'ui-agent');
    this.netRepository = new net.Repository(this.netAgent);
    this.webServer = new WebServer(this.registry, this.netRepository, (socket) => this.createSession(socket), webConfig);
  }

  async init() {
  }

  private createSession(socket: io.Socket) {
    const id = (++this.idGenerator).toString();
    const session = new Session(socket, this.netRepository, this.registry);
    this.sessions.set(id, session);
    session.on('close', () => this.sessions.delete(id));
  }

  async terminate() {
    await new Promise((resolve, reject) => {

      const array = [(cb: (err?: Error) => void) => this.webServer.close(cb), (cb: (err?: Error) => void) => this.netAgent.close(cb)];
      for (const session of this.sessions.values()) {
        array.push((cb) => session.kill(cb));
      }

      async.parallel(array, (err) => err ? reject(err) : resolve());
    });

    await this.transport.terminate();
  }
}
