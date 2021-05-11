import { logger } from 'mylife-home-common';
import { ProjectCall, ProjectCallResult, ProjectType, ResetProjectNotification, SetNameProjectNotification, UpdateProjectNotification } from '../../../shared/project-manager';
import { Services } from '..';
import { Session, SessionFeature, SessionNotifier } from '../session-manager';
import { UiProjects } from './ui/projects';
import { CoreProjects } from './core/projects';

const log = logger.createLogger('mylife:home:studio:services:project-manager:opened-projects');

const NOTIFIER_TYPE = 'project-manager/opened-project';
const SESSION_FEATURE_NAME = 'project-manager/opened-projects';

export abstract class OpenedProject {
  private readonly notifiers = new Map<string, SessionNotifier>();

  constructor(private readonly type: ProjectType, private _name: string) {
    log.debug(`Opening project '${this.id}'`);
  }

  terminate() {
    log.debug(`Closing project '${this.id}'`);
  }

  get name() {
    return this._name;
  }

  get id() {
    return makeId(this.type, this.name);
  }

  rename(newName: string) {
    const oldId = this.id;
    this._name = newName;
    log.debug(`Renaming project '${oldId}' into '${this.id}'`);

    this.notifyAll<SetNameProjectNotification>({ operation: 'set-name', name: this.name });
  }

  reload() {
    // Inherited classes must
    this.reloadModel();

    for (const notifier of this.notifiers.values()) {
      notifier.notify({ operation: 'reset' } as ResetProjectNotification);
      this.emitAllState(notifier);
    }
  }

  sessionClose(session: Session) {
    for (const notifier of this.notifiers.values()) {
      if (notifier.session === session) {
        this.notifiers.delete(notifier.id);
      }
    }
  }

  addNotifier(session: Session) {
    const notifier = session.createNotifier(NOTIFIER_TYPE);
    this.notifiers.set(notifier.id, notifier);

    setImmediate(() => this.emitAllState(notifier));

    return notifier.id;
  }

  removeNotifier(notifierId: string) {
    this.notifiers.delete(notifierId);
  }

  get unused() {
    return this.notifiers.size === 0;
  }

  notifyAll<TNotification extends UpdateProjectNotification>(data: TNotification) {
    for (const notifier of this.notifiers.values()) {
      notifier.notify(data);
    }
  }

  protected emitAllState(notifier: SessionNotifier) {
    notifier.notify({ operation: 'set-name', name: this.name } as SetNameProjectNotification);
  }

  abstract call(callData: ProjectCall): Promise<ProjectCallResult>;

  protected abstract reloadModel(): void;
}

export class OpenedProjects {
  private readonly openedProjects = new Map<string, OpenedProject>();

  constructor(private readonly coreProjects: CoreProjects, private readonly uiProjects: UiProjects) { }

  init() {
    Services.instance.sessionManager.registerSessionHandler(this.sessionHandler);

    this.coreProjects.on('renamed', this.renameCoreProject);
    this.uiProjects.on('renamed', this.renameUiProject);
    this.coreProjects.on('updated-external', this.reloadCoreProject);
    this.uiProjects.on('updated-external', this.reloadUiProject);
  }

  terminate() {
    this.coreProjects.off('renamed', this.renameCoreProject);
    this.uiProjects.off('renamed', this.renameUiProject);
    this.coreProjects.off('updated-external', this.reloadCoreProject);
    this.uiProjects.off('updated-external', this.reloadUiProject);

    for (const openedProject of this.openedProjects.values()) {
      openedProject.terminate();
    }

    this.openedProjects.clear();
  }

  private sessionHandler = (session: Session, type: 'new' | 'close') => {
    if (type !== 'close') {
      return;
    }

    const sessionNotifiers = this.getSessionNotifiers(session, false);
    if (!sessionNotifiers) {
      return;
    }

    for (const [notifierId, openedProject] of sessionNotifiers.entries()) {
      openedProject.removeNotifier(notifierId);
      this.checkCloseProject(openedProject);
    }
  };

  private renameCoreProject = (oldName: string, newName: string) => {
    this.renameProject('core', oldName, newName);
  };

  private renameUiProject = (oldName: string, newName: string) => {
    this.renameProject('ui', oldName, newName);
  };

  private reloadCoreProject = (name: string) => {
    this.reloadProject('core', name);
  };

  private reloadUiProject = (name: string) => {
    this.reloadProject('ui', name);
  };

  private renameProject(type: ProjectType, oldName: string, newName: string) {
    const oldId = makeId(type, oldName);
    const openedProject = this.openedProjects.get(oldId);
    if (!openedProject) {
      return;
    }

    openedProject.rename(newName);
    this.openedProjects.delete(oldId);
    this.openedProjects.set(openedProject.id, openedProject);
  }

  private reloadProject(type: ProjectType, name: string) {
    const id = makeId(type, name);
    const openedProject = this.openedProjects.get(id);
    if (!openedProject) {
      return;
    }

    openedProject.reload();
  }

  openProject(session: Session, type: ProjectType, name: string) {
    const openedProject = this.doOpenProject(type, name);
    const notifierId = openedProject.addNotifier(session);
    this.getSessionNotifiers(session).set(notifierId, openedProject);
    return notifierId;
  }

  closeProject(session: Session, notifierId: string) {
    const sessionNotifiers = this.getSessionNotifiers(session);
    const openedProject = sessionNotifiers.get(notifierId);
    sessionNotifiers.delete(notifierId);
    openedProject.removeNotifier(notifierId);
    this.checkCloseProject(openedProject);
  }

  executeOnProject<TReturn>(type: ProjectType, name: string, executor: (project: OpenedProject) => TReturn): TReturn {
    const openedProject = this.doOpenProject(type, name);
    try {
      return executor(openedProject);
    } finally {
      this.checkCloseProject(openedProject);
    }
  }

  private doOpenProject(type: ProjectType, name: string) {
    const id = makeId(type, name);
    let openedProject = this.openedProjects.get(id);
    if (!openedProject) {
      openedProject = this.createOpenedProject(type, name);
      this.openedProjects.set(openedProject.id, openedProject);
    }

    return openedProject;
  }

  private createOpenedProject(type: ProjectType, name: string) {
    switch (type) {
      case 'core':
        return this.coreProjects.openProject(name);
      case 'ui':
        return this.uiProjects.openProject(name);
      default:
        throw new Error(`Unknown project type: '${type}'`);
    }
  }

  private checkCloseProject(openedProject: OpenedProject) {
    if (openedProject.unused) {
      this.openedProjects.delete(openedProject.id);
      openedProject.terminate();
    }
  }

  private getSessionNotifiers(session: Session, createIfNotExist = true) {
    const existing = session.findFeature(SESSION_FEATURE_NAME) as SessionNotifiers;
    if (existing) {
      return existing.notifiers;
    }

    if (!createIfNotExist) {
      return;
    }

    const feature = new SessionNotifiers();
    session.addFeature(SESSION_FEATURE_NAME, feature);
    return feature.notifiers;
  }

  async callProject(session: Session, notifierId: string, callData: ProjectCall): Promise<ProjectCallResult> {
    const sessionNotifiers = this.getSessionNotifiers(session);
    const openedProject = sessionNotifiers.get(notifierId);
    return await openedProject.call(callData);
  }
}

function makeId(type: ProjectType, name: string) {
  return `${type}:${name}`;
}

class SessionNotifiers implements SessionFeature {
  public readonly notifiers = new Map<string, OpenedProject>();
}
