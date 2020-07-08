import io from 'socket.io';
import { components, logger } from 'mylife-home-common';
import { SessionsRegistryConnector } from './registry-connector';

const log = logger.createLogger('mylife:home:ui:sessions:manager');

export class SessionsManager {
  private readonly sessionsRegistry: SessionsRegistryConnector;
  private readonly sockets = new Set<io.Socket>();

  constructor(registry: components.Registry) {
    this.sessionsRegistry = new SessionsRegistryConnector(registry);
  }

  addClient(socket: io.Socket) {
    log.debug(`New session '${socket.id}' from '${socket.conn.remoteAddress}'`);

    this.sockets.add(socket);
    this.sessionsRegistry.addClient(socket);

    socket.once('disconnect', () => {
      this.sockets.delete(socket);
      this.sessionsRegistry.removeClient(socket);

      log.debug(`Session closed '${socket.id}'`);
    });
  }

  async terminate() {
    await Promise.all(Array.from(this.sockets).map((socket) => this.destroySocket(socket)));
    this.sessionsRegistry.terminate();
  }

  private async destroySocket(socket: io.Socket) {
    await new Promise((resolve) => {
      socket.once('disconnect', resolve);
      socket.disconnect(true);
    });
  }
}
