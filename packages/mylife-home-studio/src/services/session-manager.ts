import { EventEmitter } from 'events';
import io from 'socket.io';
import { logger } from 'mylife-home-common';
import { Service, BuildParams } from './types';

const log = logger.createLogger('mylife:home:studio:services:session-manager');

export interface SessionFeature {
}

export interface Session {

  readonly id: string;

  addFeature(key: string, feature: SessionFeature): void;
  removeFeature(key: string): void;
  getFeature(key: string): SessionFeature;

  send(payload: any): void;
}

class SessionImpl extends EventEmitter implements Session {
  private readonly features = new Map<string, SessionFeature>();

  constructor(private readonly socket: io.Socket) {
    super();

    log.debug(`Session ${this.id} connected`);

    this.socket.on('error', (err: Error) => {
      log.error(err, `Error on session ${this.id}`);
    });

    this.socket.on('disconnect', (reason: string) => {
      log.debug(`Session ${this.id} disconnected: ${reason}`);
      this.emit('close');
    });

    this.socket.on('message', (payload: any) => {
      this.emit('message', payload);
    });
  }

  forceClose() {
    this.socket.disconnect(true);
  }

  get id() {
    return this.socket.id;
  }

  addFeature(key: string, feature: SessionFeature) {
    if (this.features.get(key)) {
      throw new Error(`Feature with key '${key}' already exists for session ${this.id}`);
    }

    this.features.set(key, feature);
  }

  removeFeature(key: string) {
    if (!this.features.delete(key)) {
      throw new Error(`Feature with key '${key}' does not exist for session ${this.id}`);
    }
  }

  getFeature(key: string) {
    const feature = this.features.get(key);
    if (!feature) {
      throw new Error(`Feature with key '${key}' does not exist for session ${this.id}`);
    }
    return feature;
  }

  send(payload: any) {
    this.socket.emit('message', payload);
  }
}

export type SessionHandler = (session: Session, type: 'new' | 'close') => void;
export type MessageHandler = (session: Session, payload: any) => void;

export class SessionManager implements Service {
  private readonly server: io.Server;
  private readonly sessions = new Set<SessionImpl>();
  private readonly sessionHandlers = new Set<SessionHandler>();
  private readonly messageHandlers = new Set<MessageHandler>();

  constructor(params: BuildParams) {
    this.server = io(params.httpServer, { serveClient: false });
    this.server.on('connection', this.handleConnection);
  }

  async init() {
  }

  async terminate() {
    this.server.off('connection', this.handleConnection);

    for (const session of this.sessions) {
      session.forceClose();
    }
  }

  registerMessageHandler(handler: SessionHandler) {
    this.sessionHandlers.add(handler);
  }

  private fireMessageHandlers(session: Session, payload: any) {
    for (const handler of this.messageHandlers) {
      handler(session, payload);
    }
  }

  registerSessionHandler(handler: MessageHandler) {
    this.messageHandlers.add(handler);
  }

  private fireSessionHandlers(session: Session, type: 'new' | 'close') {
    for (const handler of this.sessionHandlers) {
      handler(session, type);
    }
  }

  private handleConnection = (socket: io.Socket) => {
    const session = new SessionImpl(socket);

    this.sessions.add(session);
    this.fireMessageHandlers(session, 'new');

    session.on('close', () => {
      this.fireSessionHandlers(session, 'close');
      this.sessions.delete(session);
    });

    session.on('message', (payload: any) => {
      this.fireMessageHandlers(session, payload);
    });
  };
}
