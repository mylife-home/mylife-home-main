import { EventEmitter } from 'events';
import io from 'socket.io';
import { logger, tools } from 'mylife-home-common';
import { ServerMessage, Notification, ServiceRequest, ServiceResponse } from '../../shared/protocol';
import { Service, BuildParams } from './types';
import { Services } from '.';

const log = logger.createLogger('mylife:home:studio:services:session-manager');

export interface SessionFeature {}

export interface Session {
  readonly id: string;

  addFeature(key: string, feature: SessionFeature): void;
  removeFeature(key: string): void;
  getFeature(key: string): SessionFeature;
  findFeature(key: string): SessionFeature;

  createNotifier(notifierType: string): SessionNotifier;
}

class SessionImpl extends EventEmitter implements Session {
  private readonly features = new Map<string, SessionFeature>();
  private notifierIdGenerator = 0;

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

  findFeature(key: string): SessionFeature {
    return this.features.get(key);
  }

  getFeature(key: string) {
    const feature = this.features.get(key);
    if (!feature) {
      throw new Error(`Feature with key '${key}' does not exist for session ${this.id}`);
    }
    return feature;
  }

  send(payload: ServerMessage) {
    this.socket.emit('message', payload);
  }

  createNotifier(notifierType: string) {
    return new SessionNotifier(this, `${++this.notifierIdGenerator}`, notifierType);
  }
}

export class SessionNotifier {
  constructor(readonly session: SessionImpl, readonly id: string, readonly type: string) {}

  notify(data: any) {
    const message: Notification = {
      type: 'notification',
      notifierId: this.id,
      notifierType: this.type,
      data,
    };

    this.session.send(message);
  }
}

export type SessionHandler = (session: Session, type: 'new' | 'close') => void;
export type ServiceHandler = (session: Session, payload: any) => Promise<any>;

export class SessionManager implements Service {
  private readonly server: io.Server;
  private readonly sessions = new Set<SessionImpl>();
  private readonly sessionHandlers = new Set<SessionHandler>();
  private readonly serviceHandlers = new Map<string, ServiceHandler>();

  constructor(params: BuildParams) {
    this.server = io(params.httpServer, { serveClient: false });
    this.server.on('connection', this.handleConnection);
  }

  async init() {}

  async terminate() {
    this.server.off('connection', this.handleConnection);

    for (const session of this.sessions) {
      session.forceClose();
    }
  }

  registerServiceHandler(service: string, handler: ServiceHandler) {
    if (this.serviceHandlers.has(service)) {
      throw new Error(`Cannot register handler for service '${service}': handler already exists`);
    }
    this.serviceHandlers.set(service, handler);
  }

  private async runServiceHandler(session: SessionImpl, request: ServiceRequest) {
    const handler = this.serviceHandlers.get(request.service);
    const response = await executeServiceHandler(session, request, handler);
    session.send(response);
  }

  registerSessionHandler(handler: SessionHandler) {
    this.sessionHandlers.add(handler);
  }

  private fireSessionHandlers(session: Session, type: 'new' | 'close') {
    for (const handler of this.sessionHandlers) {
      handler(session, type);
    }
  }

  private handleConnection = (socket: io.Socket) => {
    const session = new SessionImpl(socket);

    this.sessions.add(session);
    this.fireSessionHandlers(session, 'new');

    session.on('close', () => {
      this.fireSessionHandlers(session, 'close');
      this.sessions.delete(session);
    });

    session.on('message', (message: any) => {
      tools.fireAsync(() => this.runServiceHandler(session, message));
    });
  };
}

async function executeServiceHandler(session: Session, request: ServiceRequest, handler: ServiceHandler): Promise<ServiceResponse> {
  const { service, payload, requestId } = request;

  try {
    if (!handler) {
      throw new Error(`No service handler registered for service '${service}'`);
    }

    const result = await handler(session, payload);
    return { type: 'service-response', requestId, result };
  } catch (err) {
    log.error(err, `Error running service handler for service '${service}' on session '${session.id}'`);

    return createErrorResponse(err, requestId);
  }
}

function createErrorResponse(err: Error, requestId: string): ServiceResponse {
  const { message, stack } = err;
  const type = err.constructor.name;
  return {
    type: 'service-response',
    requestId,
    error: { message, stack, type },
  };
}

// Manager that only handle a notifier list per session (with no state per notifier)
export class SessionNotifierManager {
  private readonly notifiers = new Map<string, SessionNotifier>();

  constructor(private readonly featureName: string, private readonly notifierType: string) {}

  init() {
    Services.instance.sessionManager.registerSessionHandler(this.sessionHandler);
  }

  private sessionHandler = (session: Session, type: 'new' | 'close') => {
    if (type !== 'close') {
      return;
    }

    const ids = this.getNotifiersFromSession(session, false);
    if (ids) {
      for (const id of ids) {
        this.notifiers.delete(id);
      }
    }
  };

  createNotifier(session: Session) {
    const notifier = session.createNotifier(this.notifierType);
    this.notifiers.set(notifier.id, notifier);
    this.getNotifiersFromSession(session).add(notifier.id);

    return notifier;
  }

  removeNotifier(session: Session, notifierId: string) {
    this.notifiers.delete(notifierId);
    this.getNotifiersFromSession(session).delete(notifierId);
  }

  notifyAll(data: any) {
    for (const notifier of this.notifiers.values()) {
      notifier.notify(data);
    }
  }

  private getNotifiersFromSession(session: Session, createIfNotExist = true) {
    const existing = session.findFeature(this.featureName) as SessionNotifiers;
    if (existing) {
      return existing.notifierIds;
    }

    if (!createIfNotExist) {
      return;
    }

    const feature = new SessionNotifiers();
    session.addFeature(this.featureName, feature);
    return feature.notifierIds;
  }
}

class SessionNotifiers implements SessionFeature {
  public readonly notifierIds = new Set<string>();
}
