import { components, tools } from 'mylife-home-common';
import { Service, BuildParams } from '../types';

interface Config {
  uiPath: string;
  corePath: string;
}

export class ProjectManager implements Service {
  private readonly config: Config;

  constructor(params: BuildParams) {
    this.config = tools.getConfigItem<Config>('projectManager');
  }

  async init() {
  }

  async terminate() {
  }
}
