import { EventEmitter } from 'events';
import { logger } from 'mylife-home-common';
import { Client } from './client';

const log = logger.createLogger('mylife:home:core:plugins:driver-arduino-irc:engine:repository');

export declare interface Repository extends EventEmitter {
  on(event: 'added', listener: (key: string) => void): this;
  off(event: 'added', listener: (key: string) => void): this;
  once(event: 'added', listener: (key: string) => void): this;

  on(event: 'removed', listener: (key: string) => void): this;
  off(event: 'removed', listener: (key: string) => void): this;
  once(event: 'removed', listener: (key: string) => void): this;
}

export class Repository extends EventEmitter {
  private readonly clients = new Map<string, Client>();

  constructor() {
    super();
    this.setMaxListeners(Infinity); // each driver adds listener
  }

  add(key: string, client: Client) {
    this.clients.set(key, client);
    log.debug(`Added client: '${key}'`);
    this.emit('added', key);
  }

  remove(key: string) {
    this.clients.delete(key);
    log.debug(`Removed client: '${key}'`);
    this.emit('removed', key);
  }

  get(key: string) {
    return this.clients.get(key);
  }
}

export const repository = new Repository();
