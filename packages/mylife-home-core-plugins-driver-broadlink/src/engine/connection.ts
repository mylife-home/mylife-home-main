import EventEmitter from 'events';
import { Socket, createSocket, RemoteInfo } from 'dgram';
import { logger, tools } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-broadlink:engine:connection');

export declare interface Connection extends EventEmitter {
  on(event: 'error', listener: (err: Error) => void): this;
  off(event: 'error', listener: (err: Error) => void): this;
  once(event: 'error', listener: (err: Error) => void): this;
}

export class Connection extends EventEmitter {
  private address: string;
  private socket: Socket;
  private readonly queries = new Map<number, Query>();

  async open(address: string) {
    this.address = address;

    this.socket = createSocket({ type: 'udp4', reuseAddr: true });

    this.socket.on('error', err => this.emit('error', err));
    this.socket.on('message', (msg, rinfo) => this.message(msg, rinfo));

    await new Promise<void>(resolve => this.socket.bind(resolve));

    this.queries.clear();
  }

  close() {
    this.socket.close();

    for (const query of this.queries.values()) {
      query.cancel();
    }

    this.queries.clear();
  }

  async query(packet: Buffer): Promise<{ packet: Buffer, rinfo: RemoteInfo; }> {
    await new Promise<void>((resolve, reject) => this.socket.send(packet, 80, this.address, (err) => err ? reject(err) : resolve()));

    const query = new Query(packet);
    this.queries.set(query.id, query);
    try {
      return await query.promise;
    } finally {
      this.queries.delete(query.id);
    }
  }

  private message(packet: Buffer, rinfo: RemoteInfo) {
    const id = packet.readUInt16LE(0x28);
    const query = this.queries.get(id);
    if (query) {
      query.message(packet, rinfo);
    } else {
      log.error(`Unmatched response ignored (#${id})`);
    }
  }
};

class Query {
  readonly id: number;
  private readonly deferred = new tools.Deferred<{ packet: Buffer, rinfo: RemoteInfo; }>();
  private readonly timeout: NodeJS.Timeout;

  constructor(packet: Buffer) {
    this.id = packet.readUInt16LE(0x28);
    this.timeout = setTimeout(this.onTimeout, 3000);
  }

  get promise() {
    return this.deferred.promise;
  }

  message(packet: Buffer, rinfo: RemoteInfo) {
    clearTimeout(this.timeout);
    this.deferred.resolve({ packet, rinfo });
  }

  cancel() {
    this.deferred.reject(new Error(`Request canceled (#${this.id})`));
  }

  private readonly onTimeout = () => {
    this.deferred.reject(new Error(`Request timeout (#${this.id})`));
  };
}