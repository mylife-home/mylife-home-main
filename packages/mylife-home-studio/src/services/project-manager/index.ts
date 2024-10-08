import { ProjectType, SetListNotification, ClearListNotification, RenameListNotification, ProjectCall } from '../../../shared/project-manager';
import { Services } from '..';
import { Session, SessionNotifier, SessionNotifierManager } from '../session-manager';
import { Service, BuildParams } from '../types';
import { Store } from './store';
import { CoreProjects } from './core/projects';
import { UiProjects } from './ui/projects';
import { OpenedProject, OpenedProjects } from './opened-project';

export class ProjectManager implements Service {
  private readonly listNotifiers = new SessionNotifierManager('project-manager/list-notifiers', 'project-manager/list');
  private readonly coreProjects = new CoreProjects();
  private readonly uiProjects = new UiProjects();
  private readonly openedProjects = new OpenedProjects(this.coreProjects, this.uiProjects);

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
    const paths = Services.instance.pathManager.projectManager;

    this.coreProjects.init(paths.core);
    this.uiProjects.init(paths.ui);
    this.listNotifiers.init();
    this.openedProjects.init();

    Services.instance.sessionManager.registerServiceHandler('project-manager/start-notify-list', this.startNotifyList);
    Services.instance.sessionManager.registerServiceHandler('project-manager/stop-notify-list', this.stopNotifyList);

    Services.instance.sessionManager.registerServiceHandler('project-manager/create-new', this.createNewProject);
    Services.instance.sessionManager.registerServiceHandler('project-manager/duplicate', this.duplicateProject);
    Services.instance.sessionManager.registerServiceHandler('project-manager/rename', this.renameProject);
    Services.instance.sessionManager.registerServiceHandler('project-manager/delete', this.deleteProject);

    Services.instance.sessionManager.registerServiceHandler('project-manager/open', this.openProject);
    Services.instance.sessionManager.registerServiceHandler('project-manager/close', this.closeProject);
    Services.instance.sessionManager.registerServiceHandler('project-manager/call-opened', this.callOpenedProject);

    Services.instance.git.registerPathFeature('project/core', paths.core);
    Services.instance.git.registerPathFeature('project/ui', paths.ui);
  }

  async terminate() {
    this.openedProjects.terminate();
    await this.uiProjects.terminate();
    await this.coreProjects.terminate();
  }

  executeOnProject<TReturn>(type: ProjectType, name: string, executor: (project: OpenedProject) => TReturn): TReturn {
    return this.openedProjects.executeOnProject(type, name, executor);
  }

  private getStoreByType(type: ProjectType): Store<unknown> {
    switch (type) {
      case 'core':
        return this.coreProjects;
      case 'ui':
        return this.uiProjects;
    }
  }

  private readonly createNewProject = async (session: Session, { type, id }: { type: ProjectType; id: string; }) => {
    const store = this.getStoreByType(type);
    const createdId = await store.createNew(id);
    return { type, createdId };
  };

  private readonly duplicateProject = async (session: Session, { type, id, newId }: { type: ProjectType; id: string; newId: string; }) => {
    const store = this.getStoreByType(type);
    const createdId = await store.duplicate(id, newId);
    return { type, createdId };
  };

  private readonly renameProject = async (session: Session, { type, id, newId }: { type: ProjectType; id: string; newId: string; }) => {
    const store = this.getStoreByType(type);
    await store.rename(id, newId);
  };

  private readonly deleteProject = async (session: Session, { type, id }: { type: ProjectType; id: string; }) => {
    const store = this.getStoreByType(type);
    await store.delete(id);
  };

  private readonly startNotifyList = async (session: Session) => {
    const notifier = this.listNotifiers.createNotifier(session);

    setImmediate(() => {
      this.emitList(notifier, this.coreProjects, 'core');
      this.emitList(notifier, this.uiProjects, 'ui');
    });

    return { notifierId: notifier.id };
  };

  private emitList(notifier: SessionNotifier, store: Store<unknown>, type: ProjectType) {
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

    Services.instance.git.notifyFileUpdate();
  };

  private readonly handleCoreProjectDelete = (name: string) => {
    const notification: ClearListNotification = { operation: 'clear', type: 'core', name };
    this.listNotifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
  };

  private readonly handleCoreProjectRename = (name: string, newName: string) => {
    const notification: RenameListNotification = { operation: 'rename', type: 'core', name, newName };
    this.listNotifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
  };

  private readonly handleUiProjectSet = (name: string) => {
    const info = this.uiProjects.getProjectInfo(name);
    const notification: SetListNotification = { operation: 'set', type: 'ui', name, info };
    this.listNotifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
  };

  private readonly handleUiProjectDelete = (name: string) => {
    const notification: ClearListNotification = { operation: 'clear', type: 'ui', name };
    this.listNotifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
  };

  private readonly handleUiProjectRename = (name: string, newName: string) => {
    const notification: RenameListNotification = { operation: 'rename', type: 'ui', name, newName };
    this.listNotifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
  };

  private readonly openProject = async (session: Session, { type, id }: { type: ProjectType; id: string; }) => {
    const notifierId = this.openedProjects.openProject(session, type, id);
    return { notifierId };
  };

  private readonly closeProject = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.openedProjects.closeProject(session, notifierId);
  };

  private readonly callOpenedProject = async (session: Session, { notifierId, callData }: { notifierId: string; callData: ProjectCall; }) => {
    return await this.openedProjects.callProject(session, notifierId, callData);
  };
}
