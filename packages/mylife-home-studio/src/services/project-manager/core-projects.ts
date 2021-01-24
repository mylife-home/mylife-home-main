import { CoreProject, CoreProjectInfo, CoreProjectCall, ProjectCallResult } from '../../../shared/project-manager';
import { SessionNotifier } from '../session-manager';
import { OpenedProject } from './opened-project';
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

  openProject(name: string) {
    return new CoreOpenedProject(this, name);
  }
}

class CoreOpenedProject extends OpenedProject {
  constructor(private readonly owner: CoreProjects, name: string) {
    super('core', name);
  }

  private async updateProject(updater: (project: CoreProject) => void) {
    await this.owner.update(this.name, updater);
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    const project = this.owner.getProject(this.name);

    // TODO
  }

  async call(callData: CoreProjectCall): Promise<ProjectCallResult> {
    return null;
  }

  // TODO
}