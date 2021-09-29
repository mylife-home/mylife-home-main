// Wrapper around overkiz-client to improve typings

import EventEmitter from 'events';
import { Action, Client as OverkizClient, Command, Device, Execution } from 'overkiz-client';
import { logger, tools } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:engine:client');

export { Device };

// Wrap calls: it logger's last argument is the error if any; other arguments are concatenated
function rewriteArguments(args: any[]) {
  const strings: string[] = [];
  let error: Error;

  for (const arg of args) {
    if (arg instanceof Error) {
      error = arg;
    } else {
      strings.push(arg as string);
    }
  }

  const msg = strings.join(' ');
  return error ? [error, msg] : [msg];
}

const apiLogger = {
  debug(...args: any[]) {
    log.debug.apply(log, rewriteArguments(args));
  },
  info(...args: any[]) {
    log.info.apply(log, rewriteArguments(args));
  },
  warn(...args: any[]) {
    log.warn.apply(log, rewriteArguments(args));
  },
  error(...args: any[]) {
    log.error.apply(log, rewriteArguments(args));
  },
};

export interface Config {
  /**
   * Poll for execution events every 5 seconds by default (in seconds)
   */
  readonly execPollingPeriod?: number;

  /**
   * Poll for events every 60 seconds by default (in seconds)
   */
  readonly pollingPeriod?: number;

  /**
   * Refresh device states every 30 minutes by default (in minutes)
   */
  readonly refreshPeriod?: number;

  /**
   * default: tahoma
   */
  readonly service?: string;

  readonly user: string;
  readonly password: string;
}

export declare interface Client extends EventEmitter {
  on(event: 'onlineChanged', listener: (online: boolean) => void): this;
  off(event: 'onlineChanged', listener: (online: boolean) => void): this;
  once(event: 'onlineChanged', listener: (online: boolean) => void): this;
}

export class Client extends EventEmitter {
  private readonly impl: OverkizClient;
  private _online = false;
  private readonly executionByDevice = new Map<string, string>();

  constructor(config: Config) {
    super();

    this.impl = new OverkizClient(apiLogger, config);

    // Register to connected and disconnected events of impl.restClient.
    // Note: the restClient variable is assigned only once in ctor
    const restClient = (this.impl as any).restClient as EventEmitter;

    restClient.on('connect', () => {
      tools.fireAsync(async () => {
        // refresh immediately
        // Note: refreshTask is private
        await (this.impl as any).refreshTask();
      });

      // Mark online after refresh
      this.setOnline(true);
    });

    restClient.on('disconnect', () => {
      this.setOnline(false);
    });
  }

  destroy() {
    (this.impl as any).listenerId = null;
    (this.impl as any).setRefreshPollingPeriod(0);
    (this.impl as any).setEventPollingPeriod(0);
  }

  // Note: this list is not supposed to move during the lifetime of the client
  get devices() {
    // Devices is declared as array but is used as object by deviceURL
    const devices: { [deviceUrl: string]: Device; } = (this.impl as any).devices;
    return Object.values(devices);
  }

  get online() {
    return this._online;
  }

  private setOnline(value: boolean) {
    if (this._online !== value) {
      this._online = value;
      this.emit('onlineChanged', value);
    }
  }

  async execute(deviceURL: string, name: string, ...args: any[]) {
    const existingExecId = this.executionByDevice.get(deviceURL);
    if (existingExecId && this.impl.hasExecution(existingExecId)) {
      await this.cancelExecution(existingExecId);
    }

    const execId = await this.startExecution(deviceURL, name, args);
    this.executionByDevice.set(deviceURL, execId);
  }

  private async startExecution(deviceURL: string, name: string, args: any[]) {
    const cmd = new Command(name, ...args);
    const action = new Action(deviceURL, [cmd]);
    const exec = new Execution('MyLife Home command', action);
    const execId: string = await this.impl.execute('apply', exec);
    return execId;
  }

  private async cancelExecution(execId: string) {
    return await this.impl.cancelExecution(execId);
  }
}
