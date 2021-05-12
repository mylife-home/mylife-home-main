import { logger } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifierManager } from './session-manager';
import { CircularBuffer } from '../utils/circular-buffer';

const log = logger.createLogger('mylife:home:studio:services:git');

export class Git implements Service {
  private readonly branchUpdater: Interval;
  private readonly statusUpdater: Debounce;

  constructor(params: BuildParams) {
    this.branchUpdater = new Interval(1000, this.updateBranch);
    this.statusUpdater = new Debounce(100, this.updateStatus);
  }

  async init() {
    // Config: base directory (all others should be derived from this one)

    this.branchUpdater.init();
    this.statusUpdater.init();

    // Initial setup
    this.updateBranch();
    this.updateStatus();
  }

  async terminate() {
    this.branchUpdater.terminate();
    this.statusUpdater.terminate();
  }

  notifyFileUpdate() {
  }

  registerDirectoryFeature(featureName: string, subDirectory: string) {

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