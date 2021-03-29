import http from 'http';
import WebSocket from 'ws';
import { components, logger } from 'mylife-home-common';
import { SocketMessage, PING_INTERVAL, PING_TIMEOUT } from '../../shared/socket';
import { SessionsRegistryConnector } from './registry-connector';
import { ModelManager } from '../model';
import { EventEmitter } from 'events';

const log = logger.createLogger('mylife:home:ui:sessions:manager');

export class SessionsManager {
  private readonly idGenerator = new IdGenerator();
  private readonly sessionsRegistry: SessionsRegistryConnector;
  private readonly sessions = new Set<Session>();
  private readonly server: WebSocket.Server;

  constructor(registry: components.Registry, private readonly model: ModelManager, httpServer: http.Server) {
    this.server = new WebSocket.Server({ server: httpServer });
    this.server.on('connection', (socket: WebSocket, request: http.IncomingMessage) => {
      this.newSocket(socket, request);
    });

    this.sessionsRegistry = new SessionsRegistryConnector(registry);

    this.model.on('update', this.onModelUpdate);
    this.onModelUpdate();
  }

  private newSocket(socket: WebSocket, request: http.IncomingMessage) {
    const id = this.idGenerator.createId();
    const session = new Session(id, socket);
    log.debug(`New session '${id}' from '${request.socket.remoteAddress}'`);

    this.sessions.add(session);
    this.sessionsRegistry.addClient(session);

    session.send('modelHash', this.model.modelHash);

    session.once('close', () => {
      this.sessions.delete(session);
      this.sessionsRegistry.removeClient(session);

      log.debug(`Session closed '${id}'`);
    });
  }

  async terminate() {
    this.model.off('update', this.onModelUpdate);
    await Promise.all(Array.from(this.sessions).map((session) => this.destroySocket(session)));
    this.sessionsRegistry.terminate();
  }

  private async destroySocket(session: Session) {
    await new Promise((resolve) => {
      session.once('close', resolve);
      session.close();
    });
  }

  private readonly onModelUpdate = () => {
    this.sessionsRegistry.setRequiredComponentStates(this.model.requiredComponentStates);
    this.broadcast('modelHash', this.model.modelHash);
  };


  private broadcast(eventName: string, arg: any) {
    for (const session of this.sessions) {
      session.send(eventName, arg);
    }
  }
}

export class Session extends EventEmitter {
  private readonly heartbeat: HeartbeatManager;

  public constructor(readonly id: string, private readonly socket: WebSocket) {
    super();

    this.heartbeat = new HeartbeatManager();

    this.socket.on('error', (err: Error) => {
      log.error(err, `Socket error on session '${this.id}'`);
      this.socket.terminate();
      this.heartbeat.terminate();
      this.emit('close');
    });

    this.socket.on('close', (code: number, reason: string) => {
      log.debug(`Session closed '${this.id}' (code='${code}', reason='${reason}')`);
      this.heartbeat.terminate();
      this.emit('close');
    });

    this.socket.on('message', (raw: string) => {
      this.heartbeat.markAlive();

      const { type, data } = JSON.parse(raw) as SocketMessage;
      this.emit(type, data);
    });

    this.socket.on('ping', () => this.heartbeat.markAlive());
    this.socket.on('pong', () => this.heartbeat.markAlive());

    this.heartbeat.on('timeout', () => {
      log.error(`Socket timeout on session '${this.id}'`);
      this.socket.terminate();
      this.heartbeat.terminate();
      this.emit('close');
    });

    this.heartbeat.on('ping', () => {
      log.debug(`Session send ping '${this.id}')`);
      this.socket.ping();
    });
  }

  send(type: string, data: any) {
    const message: SocketMessage = { type, data };
    this.socket.send(JSON.stringify(message));
  }

  close() {
    this.socket.close();
  }
}

class HeartbeatManager extends EventEmitter {
  private timeout: NodeJS.Timeout;

  constructor() {
    super();
    this.timeout = setTimeout(this.onMustPing, PING_INTERVAL);
  }

  markAlive() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.onMustPing, PING_INTERVAL);
  }

  private readonly onMustPing = () => {
    this.emit('ping');
    this.timeout = setTimeout(this.onTimeout, PING_TIMEOUT);
  }

  private readonly onTimeout = () => {
    this.emit('timeout');
  }

  terminate() {
    clearTimeout(this.timeout);
  }
}

class IdGenerator {
  private counter = 0;

  createId() {
    return `${++this.counter}`;
  }
}
