import { Service, BuildParams } from './types';
import { SessionManager } from './session-manager';
import { Logging } from './logging';
import { Online } from './online';
import { ProjectManager } from './project-manager';
import { Deploy } from './deploy';
import { Git } from './git';
import { PathManager } from './path-manager';

export class Services {
  private readonly services: { [name: string]: Service; } = {};

  constructor(params: BuildParams) {
    this.services.sessionManager = new SessionManager(params);
    this.services.logging = new Logging(params);
    this.services.online = new Online(params);
    this.services.projectManager = new ProjectManager(params);
    this.services.deploy = new Deploy(params);
    this.services.git = new Git(params);
    this.services.pathManager = new PathManager(params);
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

  get git() {
    return this.services.git as Git;
  }

  get pathManager() {
    return this.services.pathManager as PathManager;
  }

  private static _instance: Services = null;

  static get instance() {
    return Services._instance;
  }
}