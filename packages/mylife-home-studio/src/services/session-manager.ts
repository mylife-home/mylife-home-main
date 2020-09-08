import { EventEmitter } from 'events';
import io from 'socket.io';
import { logger } from 'mylife-home-common';
import { Service, BuildParams } from './types';

const log = logger.createLogger('mylife:home:studio:services:session-manager');

class Session extends EventEmitter {
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
  }

  get id() {
    return this.socket.id;
  }
}

export class SessionManager implements Service {
  private readonly server: io.Server;
  private readonly sessions = new Set<Session>();

  constructor(params: BuildParams) {
    this.server = io(params.httpServer, { serveClient: false });
    this.server.on('connection', this.handleConnection);
  }

  async init() {
  }

  async terminate() {
    this.server.off('connection', this.handleConnection);
  }

  private handleConnection = (socket: io.Socket) => {
    const session = new Session(socket);
    session.on('close', () => {
      this.sessions.delete(session);
    });

    this.sessions.add(session);

    // TODO: fire event ?
  };
}
