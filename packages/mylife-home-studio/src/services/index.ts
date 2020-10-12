import { Service, BuildParams } from './types';
import { SessionManager } from './session-manager';
import { Logging } from './logging';
import { Online } from './online';

export class Services {
  private readonly services: { [name: string]: Service; } = {};

  constructor(params: BuildParams) {
    this.services.sessionManager = new SessionManager(params);
    this.services.logging = new Logging(params);
    this.services.online = new Online(params);
  }

  async init() {
    Services._instance = this;

    await Promise.all(Object.values(this.services).map(service => service.init()));
  }

  async terminate() {
    await Promise.all(Object.values(this.services).map(service => service.terminate()));

    Services._instance = null;
  }

  get sessionManager() {
    return this.services.sessionManager as SessionManager;
  }

  get logging() {
    return this.services.logging as Logging;
  }

  private static _instance: Services = null;

  static get instance() {
    return Services._instance;
  }
}