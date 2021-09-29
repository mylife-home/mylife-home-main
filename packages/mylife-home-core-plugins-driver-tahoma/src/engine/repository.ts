import { EventEmitter } from 'events';
import { logger, tools } from 'mylife-home-common';
import { Client, Device } from './client';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:engine:repository');

export declare interface Store extends EventEmitter {
  on(event: 'onlineChanged', listener: (online: boolean) => void): this;
  off(event: 'onlineChanged', listener: (online: boolean) => void): this;
  once(event: 'onlineChanged', listener: (online: boolean) => void): this;

  on(event: 'deviceAdd', listener: (device: Device) => void): this;
  off(event: 'deviceAdd', listener: (device: Device) => void): this;
  once(event: 'deviceAdd', listener: (device: Device) => void): this;

  on(event: 'deviceRemove', listener: (device: Device) => void): this;
  off(event: 'deviceRemove', listener: (device: Device) => void): this;
  once(event: 'deviceRemove', listener: (device: Device) => void): this;
}

export class Store extends EventEmitter {
  private client: Client;
  private readonly devices = new Map<string, Device>();

  constructor(readonly boxKey: string) {
    super();

    // Every device components will listen.
    this.setMaxListeners(Infinity);
  }

  setClient(client: Client) {
    this.client = client;
    this.client.on('onlineChanged', this.onClientOnlineChanged);

    if (client.online) {
      this.onClientOnlineChanged(true);
    }
  }

  unsetClient() {
    if (this.client.online) {
      this.onClientOnlineChanged(false);
    }

    this.client.off('onlineChanged', this.onClientOnlineChanged);
    this.client = null;
  }

  execute(deviceURL: string, name: string, ...args: any[]) {
    if (this.client) {
      tools.fireAsync(() => this.client.execute(deviceURL, name, ...args));
    }
  }

  private readonly onClientOnlineChanged = (online: boolean) => {
    if (online) {
      this.publishDevices();
    } else {
      this.unpublishDevices();
    }
  };

  private publishDevices() {
    for (const device of this.client.devices) {
      this.devices.set(device.deviceURL, device);
      this.emit('deviceAdd', device);
    }
  }

  private unpublishDevices() {
    for (const device of this.devices.values()) {
      this.devices.delete(device.deviceURL);
      this.emit('deviceRemove', device);
    }
  }
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