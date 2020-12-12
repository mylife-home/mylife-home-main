import { logger } from 'mylife-home-common';
import { ProjectType } from '../../../shared/project-manager';
import { Services } from '..';
import { Session, SessionFeature, SessionNotifier } from '../session-manager';

const log = logger.createLogger('mylife:home:studio:services:project-manager:opened-projects');

const NOTIFIER_TYPE = 'project-manager/opened-project';
const SESSION_FEATURE_NAME = 'project-manager/opened-projects';

export class OpenedProject {
  private readonly notifiers = new Map<string, SessionNotifier>();

  // id = type:name
  // TODO: project rename?
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
    const notifier = session.createNotifier(NOTIFIER_TYPE);
    this.notifiers.set(notifier.id, notifier);
    return notifier.id;
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

    const sessionNotifiers = this.getSessionNotifiers(session, false);
    if (!sessionNotifiers) {
      return;
    }

    for (const [notifierId, openedProject] of sessionNotifiers.entries()) {
      openedProject.removeNotifier(notifierId);
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
}

class SessionNotifiers implements SessionFeature {
  public readonly notifiers = new Map<string, OpenedProject>();
}
