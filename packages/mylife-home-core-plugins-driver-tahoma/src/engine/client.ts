import { EventEmitter } from 'events';
import { logger, tools } from 'mylife-home-common';
import { API } from './api';
import { Device, Entry } from './api-types/device';
import { DeviceStateChangedEvent, Event, ExecutionStateChangedEvent } from './api-types/event';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:engine:client');

export interface Client extends EventEmitter {
  on(event: 'onlineChanged', listener: (online: boolean) => void): this;
  off(event: 'onlineChanged', listener: (online: boolean) => void): this;
  once(event: 'onlineChanged', listener: (online: boolean) => void): this;

  on(event: 'deviceList', listener: (devices: Device[]) => void): this;
  off(event: 'deviceList', listener: (devices: Device[]) => void): this;
  once(event: 'deviceList', listener: (devices: Device[]) => void): this;

  on(event: 'stateRefresh', listener: (deviceURL: string, states: Entry[]) => void): this;
  off(event: 'stateRefresh', listener: (deviceURL: string, states: Entry[]) => void): this;
  once(event: 'stateRefresh', listener: (deviceURL: string, states: Entry[]) => void): this;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export interface Config {
  readonly user: string;
  readonly password: string;
  readonly deviceRefreshInterval?: number;
  readonly eventPollInterval?: number;
  readonly stateRefreshInterval?: number;
}

export class Client extends EventEmitter {
  private readonly api: API;
  private readonly deviceRefresh: Poller;
  private readonly eventPoll: Poller;
  private readonly stateRefresh: Poller;

  private eventListenerId: string = null;
  private readonly executions = new RunningExecutions();

  constructor({ user, password, deviceRefreshInterval = 30 * MINUTE, eventPollInterval = 2 * SECOND, stateRefreshInterval = 1 * MINUTE }: Config) {
    super();

    this.api = new API(user, password);
    this.api.on('loggedChanged', this.onApiLoggedChanged);

    this.deviceRefresh = new Poller('deviceRefresh', deviceRefreshInterval, this.onDeviceRefresh);
    this.eventPoll = new Poller('eventPoll', eventPollInterval, this.onEventPoll);
    this.stateRefresh = new Poller('stateRefresh', stateRefreshInterval, this.onStateRefresh);

    this.onDeviceRefresh();
    this.onStateRefresh();
    this.onEventPoll();
  }

  destroy() {
    this.api.off('loggedChanged', this.onApiLoggedChanged);
    this.deviceRefresh.destroy();
    this.eventPoll.destroy();
    this.stateRefresh.destroy();
  }

  execute(device: Device, command: string, ...args: any[]) {
    if (!this.online) {
      log.warn(`Client is offline, cannot run command '${command}' on device '${device}'.`);
      return;
    }

    tools.fireAsync(async () => {
      const { deviceURL } = device;
      const oldExecId = this.executions.getByDevice(deviceURL);
      if (oldExecId) {
        log.debug(`Canceling execution '${oldExecId}'`);
        await this.api.cancel(oldExecId);
        this.executions.removeByDevice(deviceURL);
      }

      const execId = await this.api.execute({ actions: [{ deviceURL, commands: [{ name: command, parameters: args }] }] });
      this.executions.set(deviceURL, execId);
      log.debug(`Started execution '${execId}' of command '${command}' on device '${deviceURL}'`);
    });
  }

  private _online = false;

  get online() {
    return this._online;
  }

  private setOnline(value: boolean) {
    this._online = value;
    this.emit('onlineChanged', this._online);
  }

  private readonly onApiLoggedChanged = (logged: boolean) => {
    if (logged) {
      tools.fireAsync(async () => {
        this.eventListenerId = await this.api.registerEvents();
      });
    } else {
      this.eventListenerId = null;
      // on disconnection, consider pending executions are lost
      this.executions.clear();
    }

    this.setOnline(logged);
  };

  private readonly onDeviceRefresh = async () => {
    const devices = await this.api.getDevices();
    this.emit('deviceList', devices);
    // it seems that calling this API reset the event listener ?!
    this.eventListenerId = await this.api.registerEvents();
  };

  private readonly onEventPoll = async () => {
    if (!this.eventListenerId) {
      return;
    }

    const events = await this.api.fetchEvents(this.eventListenerId);
    for (const event of events) {
      this.processEvent(event);
    }
  };

  private readonly onStateRefresh = async () => {
    await this.api.refreshStates();
  };

  private processEvent(event: Event) {
    switch (event.name) {
      case 'ExecutionStateChangedEvent':
        this.processExecuteStateChanged(event as ExecutionStateChangedEvent);
        break;

      case 'DeviceStateChangedEvent':
        this.processDeviceStateChanged(event as DeviceStateChangedEvent);
        break;

      // Event below does not need special action
      case 'GatewaySynchronizationStartedEvent':
      // sent to mark a group of refresh device events
      case 'GatewaySynchronizationEndedEvent':
      case 'RefreshAllDevicesStatesCompletedEvent':
      // sent after all states changes related to refresh state request is over
      case 'ExecutionRegisteredEvent':
        // sent right after execute (before execution states changes)
        break;

      default:
        log.debug(`Unhandled event type: ${event.name}`);
        break;
    }
  }

  private processExecuteStateChanged(event: ExecutionStateChangedEvent) {
    if (event.timeToNextState === -1) {
      this.executions.removeByExec(event.execId);
      log.debug(`Execution ended '${event.execId}' ${event.newState}`);
    }
  }

  private processDeviceStateChanged(event: DeviceStateChangedEvent) {
    this.emit('stateRefresh', event.deviceURL, event.deviceStates);
  }
}

class RunningExecutions {
  private readonly byDevice = new Map<string, string>();
  private readonly byExec = new Map<string, string>();

  clear() {
    this.byDevice.clear();
    this.byExec.clear();
  }

  getByDevice(deviceURL: string) {
    return this.byDevice.get(deviceURL);
  }

  set(deviceURL: string, execId: string) {
    this.byDevice.set(deviceURL, execId);
    this.byExec.set(execId, deviceURL);
  }

  removeByDevice(deviceURL: string) {
    const execId = this.byDevice.get(deviceURL);
    if (execId) {
      this.byDevice.delete(deviceURL);
      this.byExec.delete(execId);
    }
  }

  removeByExec(execId: string) {
    const deviceURL = this.byExec.get(execId);
    if (deviceURL) {
      this.byDevice.delete(deviceURL);
      this.byExec.delete(execId);
    }
  }
}

class Poller {
  private timer: NodeJS.Timeout;
  private enabled = false;

  constructor(private readonly name: string, private readonly interval: number, private readonly callback: () => Promise<void>) {
    this.timer = setTimeout(this.timerHandle, this.interval);
    this.enabled = true;
  }

  destroy() {
    this.enabled = false;
    clearTimeout(this.timer);
    this.timer = null;
  }

  private readonly timerHandle = async () => {
    this.timer = null;

    try {
      await this.callback();
    } catch (err) {
      log.error(err, `Error in Poller ${this.name}`);
    }

    if (this.enabled) {
      this.timer = setTimeout(this.timerHandle, this.interval);
    }
  };
}
