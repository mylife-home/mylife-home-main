import { logger } from 'mylife-home-common';
import { CoreProject, CoreProjectCall, ProjectCallResult, SetCoreBindingNotification, SetCoreComponentNotification, SetCorePluginsNotification } from '../../../../shared/project-manager';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { CoreProjects } from './projects';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:opened-project');

export class CoreOpenedProject extends OpenedProject {
  constructor(private readonly owner: CoreProjects, name: string, private readonly project: CoreProject) {
    super('core', name);
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    notifier.notify({ operation: 'set-core-plugins', plugins: this.project.plugins } as SetCorePluginsNotification);

    for (const [id, component] of Object.entries(this.project.components)) {
      notifier.notify({ operation: 'set-core-component', id, component } as SetCoreComponentNotification);
    }

    for (const [id, binding] of Object.entries(this.project.bindings)) {
      notifier.notify({ operation: 'set-core-binding', id, binding } as SetCoreBindingNotification);
    }
  }

  async call(callData: CoreProjectCall): Promise<ProjectCallResult> {
    // TODO
    return null;
  }
}