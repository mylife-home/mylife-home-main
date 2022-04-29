import path from 'path';
import util from 'util';
import simpleGit, { FileStatusResult, SimpleGit } from 'simple-git';
import parseDiff from 'parse-diff';
import { logger, tools } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifierManager } from './session-manager';
import { GitStatus, GitStatusNotification, DEFAULT_STATUS, GitDiff, GitDiffFile, GitCommit, GitRestore } from '../../shared/git';

const log = logger.createLogger('mylife:home:studio:services:git');

interface Config {
  appUrl: string;
  gitEnv?: object;
}

export class Git implements Service {
  private readonly fetchTimer: Interval;
  private readonly statusDebouncer: Debounce;
  private readonly refreshSingleRun: SingleRun;
  private readonly notifiers = new SessionNotifierManager('git/notifiers', 'git/status');
  private readonly featuresPaths: { featureName: string, path: string; }[] = [];
  private status = DEFAULT_STATUS;
  private git: SimpleGit;

  constructor(params: BuildParams) {

    this.fetchTimer = new Interval(6000, this.gitFetch);
    this.statusDebouncer = new Debounce(100, this.gitStatus);
    this.refreshSingleRun = new SingleRun(this.gitRefresh);
  }

  async init() {
    const config = tools.getConfigItem<Config>('git');
    this.status.appUrl = config.appUrl;

    const rootPath = Services.instance.pathManager.root;
    this.git = simpleGit({ baseDir: rootPath, maxConcurrentProcesses: 1, timeout: { block: 20000 } });
    if (config.gitEnv) {
      this.git.env(config.gitEnv);
    }

    this.fetchTimer.init();
    this.statusDebouncer.init();
    this.notifiers.init();

    Services.instance.sessionManager.registerServiceHandler('git/start-notify', this.startNotify);
    Services.instance.sessionManager.registerServiceHandler('git/stop-notify', this.stopNotify);
    Services.instance.sessionManager.registerServiceHandler('git/refresh', this.refresh);
    Services.instance.sessionManager.registerServiceHandler('git/commit', this.commit);
    Services.instance.sessionManager.registerServiceHandler('git/restore', this.restore);
    Services.instance.sessionManager.registerServiceHandler('git/diff', this.diff);

    // Initial setup
    this.gitFetch();
  }

  async terminate() {
    this.fetchTimer.terminate();
    this.statusDebouncer.terminate();
  }

  // API provided for other services

  notifyFileUpdate() {
    this.statusDebouncer.call();
  }

  registerPathFeature(featureName: string, ...paths: string[]) {
    const rootPath = Services.instance.pathManager.root;

    for (const featurePath of paths) {
      const fullPath = path.resolve(rootPath, featurePath);
      log.debug(`Configure path '${fullPath}' to feature '${featureName}'`);
      this.featuresPaths.push({ featureName, path: fullPath });
    }
  }

  // Client API

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

  private readonly refresh = async (session: Session) => {
    await this.refreshSingleRun.call();
  };

  private readonly commit = async(session: Session, { message, files }: GitCommit) => {
    await this.git.commit(message, files);
    this.statusDebouncer.call();
    return await this.computeDiff();
  };

  private readonly restore = async(session: Session, { files }: GitRestore) => {
    for (const file of files) {
      await this.git.checkout(['--', file]);
    }

    this.statusDebouncer.call();
    return await this.computeDiff();
  };

  private readonly diff = async(session: Session) => {
    return await this.computeDiff();
  };

  private async computeDiff() {
    const files = parseDiff(await this.git.diff()) as GitDiffFile[];

    // add featureName
    for (const file of files) {
      const filePath = file.from || file.to;
      file.feature = this.findFeature(filePath);
    }

    return { files } as GitDiff;
  }


  // ---

  private readonly gitFetch = async () => {
    try {
      await this.git.fetch();
      this.statusDebouncer.call();
    } catch (err) {
      log.error(err, 'Error while fetching');
    }
  };

  private readonly gitStatus = async () => {
    try {
      const status = await this.git.status();
      const branch = status.current;
      const { files, ahead, behind } = status;

      const changedFeatures = this.buildChangedFeatures(files);
      this.updateModel({ branch, changedFeatures, ahead, behind });
    } catch (err) {
      log.error(err, 'Error while updating status');
      this.updateModel(DEFAULT_STATUS);
    }
  };

  private buildChangedFeatures(files: FileStatusResult[]) {
    const changedFeatures = new Set<string>();

    // Build new changedFeatures
    for (const file of files) {
      const featureName = this.findFeature(file.path);

      if (featureName) {
        changedFeatures.add(featureName);
      }
    }

    // Consistency
    return Array.from(changedFeatures).sort();
  }

  private findFeature(filePath: string) {
    const rootPath = Services.instance.pathManager.root;
    const absPath = path.join(rootPath, filePath);

    for (const { featureName, path: featurePath } of this.featuresPaths) {
      if (absPath.startsWith(featurePath)) {
        return featureName;
      }
    }

    return null;
  }

  private updateModel(update: Partial<GitStatus>) {
    if (!this.isChange(update)) {
      return;
    }

    log.info(`Updating model with ${JSON.stringify(update)}`);

    this.status = { ...this.status, ...update };
    const notification: GitStatusNotification = { status: this.status };
    this.notifiers.notifyAll(notification);
  }

  private isChange(update: Partial<GitStatus>) {
    for (const [key, value] of Object.entries(update)) {
      if (!util.isDeepStrictEqual(this.status[key as keyof GitStatus], value)) {
        return true;
      }
    }

    return false;
  }

  private readonly gitRefresh = async () => {
    const { ahead, behind } = this.status;
    if (behind) {
      await this.git.pull();
    } else if (ahead) {
      await this.git.push();
    } else {
      await this.git.fetch();
    }

    this.statusDebouncer.call();
  };
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

class SingleRun<T = void> {
  private pending: Promise<T>;

  constructor(private readonly callback: () => Promise<T>) {
  }

  async call() {
    const owner = !this.pending;

    if (owner) {
      this.pending = this.callback();
    }

    try {
      return await this.pending;
    } finally {
      if (owner) {
        this.pending = null;
      }
    }
  }
}
