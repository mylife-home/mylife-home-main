import { CoreProject, CoreProjectInfo } from '../../../shared/project-manager';
import { Store } from './store';

export class CoreProjects extends Store<CoreProject> {

  async createNew(name: string) {
    const project: CoreProject = {
      name,
    };

    await this.create(project);
    return project.name;
  }

  getProjectInfo(name: string): CoreProjectInfo {
    return {};
  }

  // TODO
}
