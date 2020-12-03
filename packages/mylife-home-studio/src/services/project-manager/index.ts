import { ProjectType, SetListNotification, ClearListNotification } from '../../../shared/project-manager';
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
    this.coreProjects.on('created', this.handleCoreProjectSet);
    this.coreProjects.on('renamed', this.handleCoreProjectRename);
    this.coreProjects.on('deleted', this.handleCoreProjectDelete);
    this.coreProjects.on('updated', this.handleCoreProjectSet);

    this.uiProjects.on('created', this.handleUiProjectSet);
    this.uiProjects.on('renamed', this.handleUiProjectRename);
    this.uiProjects.on('deleted', this.handleUiProjectDelete);
    this.uiProjects.on('updated', this.handleUiProjectSet);
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
    for (const name of store.getProjectsNames()) {
      const info = store.getProjectInfo(name);
      const notification: SetListNotification = { operation: 'set', type, name, info };
      notifier.notify(notification);
    }
  }

  private readonly stopNotifyList = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.listNotifiers.removeNotifier(session, notifierId);
  };

  private readonly handleCoreProjectSet = (name: string) => {
    const info = this.coreProjects.getProjectInfo(name);
    const notification: SetListNotification = { operation: 'set', type: 'core', name, info };
    this.listNotifiers.notifyAll(notification);
  };

  private readonly handleCoreProjectDelete = (name: string) => {
    const notification: ClearListNotification = { operation: 'clear', type: 'core', name };
    this.listNotifiers.notifyAll(notification);
  };

  private readonly handleCoreProjectRename = (oldName: string, newName: string) => {
    this.handleCoreProjectDelete(oldName);
    this.handleCoreProjectSet(newName);
  };

  private readonly handleUiProjectSet = (name: string) => {
    const info = this.uiProjects.getProjectInfo(name);
    const notification: SetListNotification = { operation: 'set', type: 'ui', name, info };
    this.listNotifiers.notifyAll(notification);
  };

  private readonly handleUiProjectDelete = (name: string) => {
    const notification: ClearListNotification = { operation: 'clear', type: 'ui', name };
    this.listNotifiers.notifyAll(notification);
  };

  private readonly handleUiProjectRename = (oldName: string, newName: string) => {
    this.handleUiProjectDelete(oldName);
    this.handleUiProjectSet(newName);
  };

}
