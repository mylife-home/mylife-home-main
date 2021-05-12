import { logger } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifierManager } from './session-manager';
import { GitStatus, GitStatusNotification } from '../../shared/git';

const log = logger.createLogger('mylife:home:studio:services:git');

export class Git implements Service {
  private readonly branchUpdater: Interval;
  private readonly statusUpdater: Debounce;
  private readonly notifiers = new SessionNotifierManager('git/notifiers', 'git/status');
  private status: GitStatus;

  constructor(params: BuildParams) {
    this.branchUpdater = new Interval(1000, this.updateBranch);
    this.statusUpdater = new Debounce(100, this.updateStatus);
  }

  async init() {
    this.branchUpdater.init();
    this.statusUpdater.init();
    this.notifiers.init();

    Services.instance.sessionManager.registerServiceHandler('git/start-notify', this.startNotify);
    Services.instance.sessionManager.registerServiceHandler('git/stop-notify', this.stopNotify);

    // Initial setup
    this.statusUpdater.call();
    this.updateStatus();
  }

  async terminate() {
    this.branchUpdater.terminate();
    this.statusUpdater.terminate();
  }

  notifyFileUpdate() {
    this.statusUpdater.call();
  }

  registerPathFeature(featureName: string, ...paths: string[]) {
    log.debug(`Configure feature '${featureName}' from paths ${paths.map(path => `'${path}'`).join(', ')}`);

    // TODO
  }

  private readonly startNotify = async (session: Session) => {
    const notifier = this.notifiers.createNotifier(session);

    setImmediate(() => {
      const notification: GitStatusNotification = { status: this.status };
      notifier.notify(notification);
    });

    return { notifierId: notifier.id };
  };

  private readonly stopNotify = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.notifiers.removeNotifier(session, notifierId);
  };

  private emitStatus() {
    const notification: GitStatusNotification = { status: this.status };
    this.notifiers.notifyAll(notification);
  }

  private readonly updateBranch = () => {
    try {
      // TODO
    } catch(err) {
      log.error(err, 'Error while updating branch');
    }
  };


  private readonly updateStatus = () => {
    try {
      // TODO
    } catch(err) {
      log.error(err, 'Error while updating status');
    }
  };
}

// notifyFileUpdate => debounce => 'git status --porcelain'
// periodicaly => 'git branch --show-current'
// maintain state and export to UI

class Debounce {
  private handler: NodeJS.Timeout = null;

  constructor(private readonly delay: number, private readonly callback: () => void) {

  }

  init() {
  }

  terminate() {
    if (this.handler) {
      clearTimeout(this.handler);
    }
  }

  call() {
    if (!this.handler) {
      this.handler = setTimeout(this.onTimeout, this.delay);
    }
  }

  private readonly onTimeout = () => {
    this.handler = null;
    this.callback();
  };
}

class Interval {
  private handler: NodeJS.Timeout = null;

  constructor(private readonly duration: number, private readonly callback: () => void) {

  }

  init() {
    this.handler = setInterval(this.callback, this.duration);
  }

  terminate() {
    clearInterval(this.handler);
  }
}