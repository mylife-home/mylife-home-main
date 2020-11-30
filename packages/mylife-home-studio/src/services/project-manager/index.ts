import { ProjectType, CreateListNotification, DeleteListNotification, RenameListNotification } from '../../../shared/project-manager';
import { Services } from '..';
import { Session, SessionNotifier, SessionNotifierManager } from '../session-manager';
import { Service, BuildParams } from '../types';
import * as directories from './directories';
import { ProjectBase, Store } from './store';
import { CoreProjects } from './core-projects';
import { UiProjects } from './ui-projects';

export class ProjectManager implements Service {
  private readonly listNotifiers = new SessionNotifierManager('project-manager/list-notifiers', 'project-manager/list');
  private readonly uiProjects = new UiProjects();
  private readonly coreProjects = new CoreProjects();

  constructor(params: BuildParams) {
    this.coreProjects.on('created', this.handleCoreProjectCreate);
    this.coreProjects.on('renamed', this.handleCoreProjectRename);
    this.coreProjects.on('deleted', this.handleCoreProjectDelete);

    this.uiProjects.on('created', this.handleUiProjectCreate);
    this.uiProjects.on('renamed', this.handleUiProjectRename);
    this.uiProjects.on('deleted', this.handleUiProjectDelete);
  }

  async init() {
    directories.configure();
    await this.uiProjects.init(directories.ui());
    await this.coreProjects.init(directories.core());
    this.listNotifiers.init();

    Services.instance.sessionManager.registerServiceHandler('project-manager/start-notify-list', this.startNotifyList);
    Services.instance.sessionManager.registerServiceHandler('project-manager/stop-notify-list', this.stopNotifyList);
  }

  async terminate() {
  }

  private readonly startNotifyList = async (session: Session) => {
    const notifier = this.listNotifiers.createNotifier(session);

    setImmediate(() => {
      this.emitList(notifier, this.coreProjects, 'core');
      this.emitList(notifier, this.uiProjects, 'ui');
    });

    return { notifierId: notifier.id };
  };

  private emitList(notifier: SessionNotifier, store: Store<ProjectBase>, type: ProjectType) {
    for (const { name } of store.getProjects()) {
      const notification: CreateListNotification = { operation: 'create', type, name };
      notifier.notify(notification);
    }
  }

  private readonly stopNotifyList = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.listNotifiers.removeNotifier(session, notifierId);
  };

  private readonly handleCoreProjectCreate = (name: string) => {
    const notification: CreateListNotification = { operation: 'create', type: 'core', name };
    this.listNotifiers.notifyAll(notification);
  };

  private readonly handleCoreProjectDelete = (name: string) => {
    const notification: DeleteListNotification = { operation: 'delete', type: 'core', name };
    this.listNotifiers.notifyAll(notification);
  };

  private readonly handleCoreProjectRename = (oldName: string, newName: string) => {
    const notification: RenameListNotification = { operation: 'rename', type: 'core', oldName, newName };
    this.listNotifiers.notifyAll(notification);
  };

  private readonly handleUiProjectCreate = (name: string) => {
    const notification: CreateListNotification = { operation: 'create', type: 'ui', name };
    this.listNotifiers.notifyAll(notification);
  };

  private readonly handleUiProjectDelete = (name: string) => {
    const notification: DeleteListNotification = { operation: 'delete', type: 'ui', name };
    this.listNotifiers.notifyAll(notification);
  };

  private readonly handleUiProjectRename = (oldName: string, newName: string) => {
    const notification: RenameListNotification = { operation: 'rename', type: 'ui', oldName, newName };
    this.listNotifiers.notifyAll(notification);
  };

}
