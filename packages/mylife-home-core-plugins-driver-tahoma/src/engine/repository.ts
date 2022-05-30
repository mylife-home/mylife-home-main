import { EventEmitter } from 'events';
import { logger } from 'mylife-home-common';
import { Entry as ApiEntry, Device as ApiDevice } from './api-types/device';
import { Client } from './client';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:engine:repository');

export interface Device {
  readonly deviceURL: string;
  readonly type: string;
}

export interface DeviceState {
  readonly deviceURL: string;
  readonly name: string;
  readonly type: number;
  readonly value: any;
}

export declare interface Store extends EventEmitter {
  on(event: 'onlineChanged', listener: (online: boolean) => void): this;
  off(event: 'onlineChanged', listener: (online: boolean) => void): this;
  once(event: 'onlineChanged', listener: (online: boolean) => void): this;

  on(event: 'deviceAdded', listener: (device: Device) => void): this;
  off(event: 'deviceAdded', listener: (device: Device) => void): this;
  once(event: 'deviceAdded', listener: (device: Device) => void): this;

  on(event: 'deviceRemoved', listener: (device: Device) => void): this;
  off(event: 'deviceRemoved', listener: (device: Device) => void): this;
  once(event: 'deviceRemoved', listener: (device: Device) => void): this;

  // Note: not emitted on deviceRemoved
  on(event: 'stateChanged', listener: (state: DeviceState) => void): this;
  off(event: 'stateChanged', listener: (state: DeviceState) => void): this;
  once(event: 'stateChanged', listener: (state: DeviceState) => void): this;

  on(event: 'execChanged', listener: (deviceURL: string, executing: boolean) => void): this;
  off(event: 'execChanged', listener: (deviceURL: string, executing: boolean) => void): this;
  once(event: 'execChanged', listener: (deviceURL: string, executing: boolean) => void): this;
}

export class Store extends EventEmitter {
  private client: Client;
  private readonly devices = new Map<string, Device>();
  private readonly states = new Map<string, DeviceState>(); // key = <deviceURL>$<name>

  constructor(readonly boxKey: string) {
    super();

    // Every device components will listen.
    this.setMaxListeners(Infinity);
  }

  setClient(client: Client) {
    this.client = client;
    this.client.on('onlineChanged', this.onOnlineChanged);
    this.client.on('deviceList', this.onDeviceList);
    this.client.on('stateRefresh', this.onStateRefresh);
    this.client.on('execRefresh', this.onExecRefresh);

    if (client.online) {
      this.onOnlineChanged(true);
    }
  }

  unsetClient() {
    if (this.client.online) {
      this.onOnlineChanged(false);

      for (const device of this.devices.values()) {
        this.devices.delete(device.deviceURL);
        this.emit('deviceRemoved', device);
      }

      this.states.clear();
    }

    this.client.off('onlineChanged', this.onOnlineChanged);
    this.client.off('deviceList', this.onDeviceList);
    this.client.off('stateRefresh', this.onStateRefresh);
    this.client.off('execRefresh', this.onExecRefresh);
    this.client = null;
  }

  execute(deviceURL: string, command: string, ...args: any[]) {
    if (this.client) {
      this.client.execute(deviceURL, command, ...args);
    }
  }

  interrupt(deviceURL: string) {
    if (this.client) {
      this.client.interrupt(deviceURL);
    }
  }

  get online() {
    return !!this.client && this.client.online;
  }

  getDevice(deviceURL: string) {
    return this.devices.get(deviceURL);
  }

  getState(deviceURL: string, stateName: string) {
    const key = makeStateKey(deviceURL, stateName);
    return this.states.get(key);
  }

  private readonly onOnlineChanged = (online: boolean) => {
    this.emit('onlineChanged', online);
    // for now we consider devices stay even if offline (and states will stay accurate ...)
  };

  private readonly onDeviceList = (devices: ApiDevice[]) => {
    const list = new Set<string>();

    // add/update
    for (const { deviceURL, definition, states } of devices) {
      list.add(deviceURL);
      const existing = this.devices.get(deviceURL);
      if (!existing) {
        const newDevice: Device = { deviceURL, type: definition.qualifiedName };
        this.devices.set(newDevice.deviceURL, newDevice);
        this.emit('deviceAdded', newDevice);
      }

      this.onStateRefresh(deviceURL, states);
    }

    // remove
    for (const device of this.devices.values()) {
      const { deviceURL } = device;
      if (!list.has(deviceURL)) {
        this.devices.delete(deviceURL);
        this.emit('deviceRemoved', device);
      }
    }
  };

  private readonly onStateRefresh = (deviceURL: string, states: ApiEntry[]) => {
    for (const state of states || []) {
      const key = makeStateKey(deviceURL, state.name);
      const oldState = this.states.get(key);

      if (!oldState || oldState.value !== state.value) {
        const newState: DeviceState = { deviceURL, ...state };
        this.states.set(key, newState);
        this.emit('stateChanged', newState);
      }
    }
  };

  private readonly onExecRefresh = (deviceURL: string, executing: boolean) => {
    this.emit('execChanged', deviceURL, executing);
  };

  isExecuting(deviceURL: string) {
    return !!this.client && this.client.isExecuting(deviceURL);
  }
}

function makeStateKey(deviceURL: string, stateName: string) {
  return `${deviceURL}$${stateName}`;
}

interface StoreContainer {
  readonly store: Store;
  refCount: number;
}

const repository = new Map<string, StoreContainer>();

export function getStore(boxKey: string) {
  let container = repository.get(boxKey);
  if (!container) {
    log.info(`Creating new store for box key '${boxKey}'`);
    container = { store: new Store(boxKey), refCount: 0 };
    repository.set(boxKey, container);
  }

  ++container.refCount;
  return container.store;
}

export function releaseStore(boxKey: string) {
  const container = repository.get(boxKey);
  if (--container.refCount === 0) {
    log.info(`Removing store for box key '${boxKey}'`);
    repository.delete(boxKey);
  }
}