import path from 'path';
import simpleGit, { FileStatusResult, SimpleGit } from 'simple-git';
import { logger, tools } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifierManager } from './session-manager';
import { GitStatus, GitChangedFeatures, GitStatusNotification, DEFAULT_STATUS } from '../../shared/git';

const log = logger.createLogger('mylife:home:studio:services:git');

interface Config {
  appUrl: string;
}

export class Git implements Service {
  private readonly intervalUpdater: Interval;
  private readonly statusUpdater: Debounce;
  private readonly notifiers = new SessionNotifierManager('git/notifiers', 'git/status');
  private readonly featuresPaths: { featureName: string, path: string; }[] = [];
  private status = DEFAULT_STATUS;
  private git: SimpleGit;

  constructor(params: BuildParams) {
    const config = tools.getConfigItem<Config>('git');
    this.status.appUrl = config.appUrl;

    this.intervalUpdater = new Interval(6000, this.intervalUpdate);
    this.statusUpdater = new Debounce(100, this.updateStatus);
  }

  async init() {
    const rootPath = Services.instance.pathManager.root;
    this.git = simpleGit({ baseDir: rootPath, maxConcurrentProcesses: 1, timeout: { block: 5000 } });

    this.intervalUpdater.init();
    this.statusUpdater.init();
    this.notifiers.init();

    Services.instance.sessionManager.registerServiceHandler('git/start-notify', this.startNotify);
    Services.instance.sessionManager.registerServiceHandler('git/stop-notify', this.stopNotify);

    // Initial setup
    this.statusUpdater.call();
    this.updateStatus();
  }

  async terminate() {
    this.intervalUpdater.terminate();
    this.statusUpdater.terminate();
  }

  notifyFileUpdate() {
    this.statusUpdater.call();
  }

  registerPathFeature(featureName: string, ...paths: string[]) {
    const rootPath = Services.instance.pathManager.root;

    for (const featurePath of paths) {
      const fullPath = path.resolve(rootPath, featurePath);
      log.debug(`Configure path '${fullPath}' to feature '${featureName}'`);
      this.featuresPaths.push({ featureName, path: fullPath });
    }
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

  private updateModel(update: Partial<GitStatus>) {
    this.status = { ...this.status, ...update };
    const notification: GitStatusNotification = { status: this.status };
    this.notifiers.notifyAll(notification);
  }

  private readonly intervalUpdate = async () => {
    // we need to do that too because in case of git commit we have no file change
    this.notifyFileUpdate();

    try {
      const summary = await this.git.branch();
      const branch = summary.current;
      this.updateBranchModel(branch);
    } catch (err) {
      log.error(err, 'Error while updating branch');
      this.updateModel({ branch: DEFAULT_STATUS.branch });
    }
  };

  private updateBranchModel(branch: string) {
    if (this.status.branch === branch) {
      // No change since last update
      return;
    }

    log.info(`Setting branch to '${branch}'`);
    this.updateModel({ branch });
  }

  private readonly updateStatus = async () => {
    try {
      const status = await this.git.status();
      this.updateStatusModel(status.files);
    } catch (err) {
      log.error(err, 'Error while updating status');
      this.updateModel({ changedFeatures: {} });
    }
  };

  private updateStatusModel(files: FileStatusResult[]) {
    const changedFeatures = this.buildChangedFeatures(files);

    if (areSameChangedFeatures(changedFeatures, this.status.changedFeatures)) {
      // No change since last update
      return;
    }

    log.info(`Setting changed features to ${JSON.stringify(changedFeatures)}`);
    this.updateModel({ changedFeatures });
  }

  private buildChangedFeatures(files: FileStatusResult[]) {
    const rootPath = Services.instance.pathManager.root;
    const changedFeatures: GitChangedFeatures = {};

    // Build new changedFeatures
    for (const file of files) {
      const filePath = path.join(rootPath, file.path);

      for (const { featureName, path: featurePath } of this.featuresPaths) {
        if (!filePath.startsWith(featurePath)) {
          continue;
        }

        changedFeatures[featureName] = changedFeatures[featureName] || [];
        changedFeatures[featureName].push(path.relative(featurePath, filePath));
      }
    }

    // Consistency
    for (const list of Object.values(changedFeatures)) {
      list.sort();
    }

    return changedFeatures;
  }
}

function areSameChangedFeatures(changedFeatures1: GitChangedFeatures, changedFeatures2: GitChangedFeatures) {
  const keys1 = Object.keys(changedFeatures1).sort();
  const keys2 = Object.keys(changedFeatures2).sort();

  if (!areSameSortedArray(keys1, keys2)) {
    return false;
  }

  for (const key of keys1) {
    const changes1 = changedFeatures1[key];
    const changes2 = changedFeatures2[key];
    if (!areSameSortedArray(changes1, changes2)) {
      return false;
    }
  }

  return true;
}

function areSameSortedArray(array1: string[], array2: string[]) {
  if (array1.length !== array2.length) {
    return false;
  }

  for (const [index, value] of array1.entries()) {
    if (array2[index] !== value) {
      return false;
    }
  }

  return true;
}


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
