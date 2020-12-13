import { CoreProject, CoreProjectInfo } from '../../../shared/project-manager';
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

  openProject(id: string) {
    return new CoreOpenedProject(id);
  }
}

class CoreOpenedProject extends OpenedProject {
  constructor(id: string) {
    super(id);
  }

  terminate() {
    super.terminate();
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    // TODO
  }

  // TODO
}