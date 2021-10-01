import { EventEmitter } from 'events';
import { logger, tools } from 'mylife-home-common';
import { API } from './api';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:engine:client');

export interface Client extends EventEmitter {
  on(event: 'onlineChanged', listener: (online: boolean) => void): this;
  off(event: 'onlineChanged', listener: (online: boolean) => void): this;
  once(event: 'onlineChanged', listener: (online: boolean) => void): this;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export interface Config {
  readonly user: string;
  readonly password: string;
  readonly deviceRefreshInterval: number;
  readonly eventPollInterval: number;
  readonly stateRefreshInterval: number;
}

export class Client extends EventEmitter {
  private readonly api: API;
  private readonly deviceRefresh: Poller;
  private readonly eventPoll: Poller;
  private readonly stateRefresh: Poller;
  private eventListenerId: string = null;

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
    }

    this.setOnline(logged);
  };

  private readonly onDeviceRefresh = async () => {
    const devices = await this.api.getDevices();
    // TODO
    console.dir(devices, { depth: null });
  };

  private readonly onEventPoll = async () => {
    if (!this.eventListenerId) {
      return;
    }

    const events = await this.api.fetchEvents(this.eventListenerId);
    // TODO
    console.dir(events, { depth: null });
  };

  private readonly onStateRefresh = async () => {
    await this.api.refreshStates();
  };
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
