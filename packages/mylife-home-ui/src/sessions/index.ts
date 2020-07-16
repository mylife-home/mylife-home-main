import io from 'socket.io';
import { components, logger } from 'mylife-home-common';
import { SessionsRegistryConnector } from './registry-connector';
import { ModelManager } from '../model';

const log = logger.createLogger('mylife:home:ui:sessions:manager');

export class SessionsManager {
  private readonly sessionsRegistry: SessionsRegistryConnector;
  private readonly sockets = new Set<io.Socket>();

  constructor(registry: components.Registry, private readonly model: ModelManager) {
    this.sessionsRegistry = new SessionsRegistryConnector(registry);
    this.model.on('update', this.onModelUpdate);
  }

  addClient(socket: io.Socket) {
    log.debug(`New session '${socket.id}' from '${socket.conn.remoteAddress}'`);

    this.sockets.add(socket);
    this.sessionsRegistry.addClient(socket);

    socket.emit('modelHash', this.model.modelHash);

    socket.once('disconnect', () => {
      this.sockets.delete(socket);
      this.sessionsRegistry.removeClient(socket);

      log.debug(`Session closed '${socket.id}'`);
    });
  }

  async terminate() {
    this.model.off('update', this.onModelUpdate);
    await Promise.all(Array.from(this.sockets).map((socket) => this.destroySocket(socket)));
    this.sessionsRegistry.terminate();
  }

  private async destroySocket(socket: io.Socket) {
    await new Promise((resolve) => {
      socket.once('disconnect', resolve);
      socket.disconnect(true);
    });
  }

  private readonly onModelUpdate = () => {
    this.sessionsRegistry.setRequiredComponentStates(this.model.requiredComponentStates);
    this.broadcast('modelHash', this.model.modelHash);
  };


  private broadcast(eventName: string, arg: any) {
    for (const socket of this.sockets) {
      socket.emit(eventName, arg);
    }
  }
}
