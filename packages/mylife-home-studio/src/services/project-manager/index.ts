import { Services } from '..';
import { Session, SessionNotifier, SessionNotifierManager } from '../session-manager';
import { Service, BuildParams } from '../types';
import { CoreProjects } from './core-projects';
import * as directories from './directories';
import { UiProjects } from './ui-projects';

export class ProjectManager implements Service {
  private readonly listNotifiers = new SessionNotifierManager('project-manager/list-notifiers', 'project-manager/list');
  private readonly uiProjects = new UiProjects();
  private readonly coreProjects = new CoreProjects();

  constructor(params: BuildParams) {
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
      // TODO
    });

    return { notifierId: notifier.id };
  };

  private readonly stopNotifyList = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.listNotifiers.removeNotifier(session, notifierId);
  };
}
