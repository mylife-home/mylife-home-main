import { Service, BuildParams } from './types';
import http from 'http';
import io from 'socket.io';

class Session {

}

export class SessionManager implements Service {
  private readonly server: io.Server;

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

  };
}
