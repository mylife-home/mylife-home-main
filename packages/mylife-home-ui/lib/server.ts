import { EventEmitter } from 'events';
import async from 'async';
import io from 'socket.io';
import * as net from './net';
import WebServer from './web/server';

class Session extends EventEmitter {
  constructor(private readonly socket: io.Socket, private readonly netRepository: net.Repository) {
    super();

    this.socket.on('disconnect', () => this.emit('close'));
    this.socket.on('action', (data) => this.netRepository.action(data.id, data.name, data.args));

    this.netRepository.on('add', (id: string, obj: net.RemoteObject) => this.socket.emit('add', { id: id, attributes: this.objAttributes(obj) }));
    this.netRepository.on('remove', (id: string) => this.socket.emit('remove', { id: id }));
    this.netRepository.on('change', (id: string, name: string, value: string) => this.socket.emit('change', { id: id, name: name, value: value }));

    this.sendState();
  }

  private objAttributes(obj: net.RemoteObject) {
    const attrs: { [id: string]: string } = {};
    for (const name of obj.attributes) {
      attrs[name] = obj.attribute(name);
    }
    return attrs;
  }

  private sendState() {
    const data: { [id: string]: { [id: string]: string } } = {};
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

export default class Server {
  private readonly sessions = new Map<string, Session>();
  private idGenerator = 0;
  private readonly netAgent: net.Client;
  private readonly netRepository: net.Repository;
  private readonly webServer: WebServer;

  constructor(config: any, dev: boolean) {
    this.netAgent = new net.Client(config.net, 'ui-agent');
    this.netRepository = new net.Repository(this.netAgent);
    this.webServer = new WebServer(this.netRepository, (socket) => this.createSession(socket), config.web, dev);
  }

  private createSession(socket: io.Socket) {
    const id = (++this.idGenerator).toString();
    const session = new Session(socket, this.netRepository);
    this.sessions.set(id, session);
    session.on('close', () => this.sessions.delete(id));
  }

  close(cb: (err?: Error) => void) {
    const array = [(cb: (err?: Error) => void) => this.webServer.close(cb), (cb: (err?: Error) => void) => this.netAgent.close(cb)];
    for (const session of this.sessions.values()) {
      array.push((cb) => session.kill(cb));
    }

    async.parallel(array, cb);
  }
}
