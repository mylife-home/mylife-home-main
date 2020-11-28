import fs from 'fs-extra';
import { components, tools } from 'mylife-home-common';
import { Service, BuildParams } from '../../types';
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
    const finalPath = path.resolve(this.config.localPath);
    await fs.emptyDir(finalPath);
    await this.git.clone({
      dir: finalPath,
      url: this.config.githubUrl,
    });
    */
  }

  async terminate() {
  }
}
