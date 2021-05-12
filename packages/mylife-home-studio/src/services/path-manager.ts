import path from 'path';
import { logger, tools } from 'mylife-home-common';
import { BuildParams, Service } from './types';

const log = logger.createLogger('mylife:home:studio:services:path-manager');

export interface ProjectManagerPaths {
  readonly core: string;
  readonly ui: string;
}

export interface DeployPaths {
  readonly recipes: string;
  readonly files: string;
  readonly pins: string;
}

interface Config {
  root: string;
  projectManager: {
    core: string;
    ui: string;
  },
  deploy: {
    files: string;
    recipes: string;
    pinnedRecipesFile: string;
  }
}

export class PathManager implements Service {
  public readonly root: string;
  public readonly projectManager: ProjectManagerPaths;
  public readonly deploy: DeployPaths;

  constructor(params: BuildParams) {
    const config = tools.getConfigItem<Config>('paths');

    this.root = path.resolve(config.root);

    this.projectManager = {
      core: path.resolve(this.root, config.projectManager.core),
      ui: path.resolve(this.root, config.projectManager.ui),
    };

    this.deploy = {
      files: path.resolve(this.root, config.deploy.files),
      recipes: path.resolve(this.root, config.deploy.recipes),
      pins: path.resolve(this.root, config.deploy.pinnedRecipesFile),
    };

    log.info(`root path: '${this.root}'`);
    log.info(`projectManager.core path: '${this.projectManager.core}'`);
    log.info(`projectManager.ui path: '${this.projectManager.ui}'`);
    log.info(`deploy.files path: '${this.deploy.files}'`);
    log.info(`deploy.recipes path: '${this.deploy.recipes}'`);
    log.info(`deploy.pins path: '${this.deploy.pins}'`);
  }

  async init() {
  }

  async terminate() {
  }
}
