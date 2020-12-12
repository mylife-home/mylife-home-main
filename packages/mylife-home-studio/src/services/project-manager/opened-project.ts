import { logger } from 'mylife-home-common';
import { ProjectType } from '../../../shared/project-manager';
import { Services } from '..';
import { Session, SessionNotifier } from '../session-manager';

const log = logger.createLogger('mylife:home:studio:services:project-manager:opened-projects');

export class OpenedProject {
  private readonly notifiers = new Map<string, SessionNotifier>();

  // id = type:name
  constructor(public readonly id: string) {
    log.debug(`Opening project '${this.id}'`);
  }

  terminate() {
    log.debug(`Closing project '${this.id}'`);
  }

  sessionClose(session: Session) {
    for (const notifier of this.notifiers.values()) {
      if (notifier.session === session) {
        this.notifiers.delete(notifier.id);
      }
    }
  }

  addNotifier(session: Session) {
    const notifier = session.createNotifier('project-manager/opened-project');
    this.notifiers.set(notifier.id, notifier);
    return notifier.id;
  }

  // TODO: better indexing
  hasNotifier(notifierId: string) {
    return this.notifiers.has(notifierId);
  }

  removeNotifier(notifierId: string) {
    this.notifiers.delete(notifierId);
  }

  get unused() {
    return this.notifiers.size === 0;
  }
}

export class OpenedProjects {
  private readonly openedProjects = new Map<string, OpenedProject>();

  init() {
    Services.instance.sessionManager.registerSessionHandler(this.sessionHandler);
  }

  terminate() {
    for (const openedProject of this.openedProjects.values()) {
      openedProject.terminate();
    }

    this.openedProjects.clear();
  }

  private sessionHandler = (session: Session, type: 'new' | 'close') => {
    if (type !== 'close') {
      return;
    }

    for (const openedProject of this.openedProjects.values()) {
      openedProject.sessionClose(session);
      this.checkCloseProject(openedProject);
    }
  };

  openProject(session: Session, type: ProjectType, name: string) {
    const id = `${type}:${name}`;
    let openedProject = this.openedProjects.get(id);
    if (!openedProject) {
      // TODO: create opened project
      openedProject = new OpenedProject(id);
      this.openedProjects.set(openedProject.id, openedProject);
    }

    return openedProject.addNotifier(session);
  }

  closeProject(notifierId: string) {
    const openedProject = this.getOpenedProjectByNotifierId(notifierId);
    openedProject.removeNotifier(notifierId);
    this.checkCloseProject(openedProject);
  }

  private getOpenedProjectByNotifierId(notifierId: string) {
    for (const openedProject of this.openedProjects.values()) {
      if (openedProject.hasNotifier(notifierId)) {
        return openedProject;
      }
    }

    throw new Error(`No opened projet with notifier id '${notifierId}'`);
  }

  private checkCloseProject(openedProject: OpenedProject) {
    if (openedProject.unused) {
      this.openedProjects.delete(openedProject.id);
      openedProject.terminate();
    }
  }
}
