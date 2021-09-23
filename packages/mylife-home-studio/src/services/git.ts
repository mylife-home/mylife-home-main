import path from 'path';
import cp from 'child_process';
import { logger, tools } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifierManager } from './session-manager';
import { GitStatus, GitStatusNotification, DEFAULT_STATUS } from '../../shared/git';

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
  private rawStatus: string = null; // help to find changes before parsing

  constructor(params: BuildParams) {
    const config = tools.getConfigItem<Config>('git');
    this.status.appUrl = config.appUrl;

    this.intervalUpdater = new Interval(1000, this.intervalUpdate);
    this.statusUpdater = new Debounce(100, this.updateStatus);
  }

  async init() {
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

  private runGit(...args: string[]) {
    const rootPath = Services.instance.pathManager.root;
    return cp.execFileSync('git', args, { encoding: 'utf8', cwd: rootPath, timeout: 5000 });
  }

  private readonly intervalUpdate = () => {
    // we need to do that too because in case of git commit we have no file change
    this.notifyFileUpdate();

    try {
      let branch = this.runGit('branch', '--show-current');
      // remove last \n char at the end
      branch = branch.slice(0, branch.length - 1);
      this.updateBranchModel(branch);
    } catch (err) {
      log.error(err, 'Error while updating branch');
      this.updateBranchModel(DEFAULT_STATUS.branch);
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

  private readonly updateStatus = () => {
    try {
      const raw = this.runGit('status', '--porcelain', '-z');
      this.updateStatusModel(raw);
    } catch (err) {
      log.error(err, 'Error while updating status');
      this.updateStatusModel(null);
    }
  };

  private updateStatusModel(raw: string) {
    if (raw === this.rawStatus) {
      // No change since last update
      return;
    }

    const gitFiles = parseGitStatus(raw);
    const changedFeatures = this.buildChangedFeatures(gitFiles);
    log.info(`Setting changed features to ${JSON.stringify(changedFeatures)}`);
    this.updateModel({ changedFeatures });
    this.rawStatus = raw;
  }

  private buildChangedFeatures(gitFiles: FileStatus[]) {
    const rootPath = Services.instance.pathManager.root;
    const changedFeatures: GitStatus['changedFeatures'] = {};

    // Build new changedFeatures
    for (const gitFile of gitFiles) {
      const filePath = path.join(rootPath, gitFile.to);

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

// From https://github.com/jamestalmage/parse-git-status/blob/master/index.js

interface FileStatus {
  x: string;
  y: string;
  to: string;
  from: string;
}

function parseGitStatus(input: string) {
  const parts = input.split('\0');
  const files: FileStatus[] = [];

  for (var partIndex = 0; partIndex < parts.length; ++partIndex) {
    const part = parts[partIndex];

    if (!part.length) {
      continue;
    }

    const fileStatus: FileStatus = {
      x: part[0],
      y: part[1],
      to: part.substring(3),
      from: null
    };

    if (fileStatus.x === 'R') {
      fileStatus.from = parts[++partIndex];
    }

    files.push(fileStatus);
  }

  return files;
}
