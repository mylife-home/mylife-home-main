import fs from 'fs-extra';
import { components } from 'mylife-home-common';
import { tools } from 'mylife-home-common';
import { Service, BuildParams } from '../types';
import { Git } from './git';

interface Config {
  localPath: string;
  githubUrl: string;
  githubToken: string;
}

export class ProjectManager implements Service {
  private readonly git: Git;
  private readonly config: Config;

  constructor(params: BuildParams) {
    this.config = tools.getConfigItem<Config>('projectManager');
    this.git = new Git(this.config.githubToken);
  }

  async init() {
    /*
    await fs.emptyDir(this.config.localPath);
    await this.git.clone({
      dir: this.config.localPath,
      url: this.config.githubUrl,
    });
    */
  }

  async terminate() {
  }
}
