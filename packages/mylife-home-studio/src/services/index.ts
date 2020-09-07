import { bus } from 'mylife-home-common';
import { Service } from './types';
import { Logging } from './logging';
import { SessionManager } from './session-manager';

export class Services {
  private readonly services: { [name: string]: Service } = {};

  constructor(transport: bus.Transport) {
    this.services.logging = new Logging(transport);
    this.services.sessionManager = new SessionManager();
  }

  async init() {
    await Promise.all(Object.values(this.services).map(service => service.init()));
  }

  async terminate() {
    await Promise.all(Object.values(this.services).map(service => service.terminate()));
  }

  get logging() {
    return this.services.logging as Logging;
  }

  get sessionManager() {
    return this.services.sessionManager as SessionManager;
  }
}