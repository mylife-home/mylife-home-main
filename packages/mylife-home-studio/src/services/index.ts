import { Service, BuildParams } from './types';
import { SessionManager } from './session-manager';
import { Logging } from './logging';
import { Online } from './online';
import { ProjectManager } from './project-manager';
import { Deploy } from './deploy';

export class Services {
  private readonly services: { [name: string]: Service; } = {};

  constructor(params: BuildParams) {
    this.services.sessionManager = new SessionManager(params);
    this.services.logging = new Logging(params);
    this.services.online = new Online(params);
    this.services.projectManager = new ProjectManager(params);
    this.services.deploy = new Deploy(params);
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

  get online() {
    return this.services.online as Online;
  }

  get projectManager() {
    return this.services.projectManager as ProjectManager;
  }

  get deploy() {
    return this.services.deploy as Deploy;
  }

  private static _instance: Services = null;

  static get instance() {
    return Services._instance;
  }
}