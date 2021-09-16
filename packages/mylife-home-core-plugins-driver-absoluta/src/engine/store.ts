import { EventEmitter } from 'events';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-absoluta:engine:store');

export declare interface Store extends EventEmitter {
  on(event: 'changed', listener: (label: string, active: boolean) => void): this;
  off(event: 'changed', listener: (label: string, active: boolean) => void): this;
  once(event: 'changed', listener: (label: string, active: boolean) => void): this;
}

export class Store extends EventEmitter {
  private readonly values = new Map<string, boolean>();

  constructor() {
    super();

    this.setMaxListeners(100); // each zone adds listener
  }

  setActive(label: string, active: boolean) {
    if (this.isActive(label) === active) {
      return;
    }

    this.values.set(label, active);
    this.emit('changed', label, active);
  }

  isActive(label: string) {
    return this.values.get(label) || false;
  }
}

interface StoreData {
  store: Store;
  refCount: number;
}

const stores = new Map<string, StoreData>();

export function getStore(boxKey: string) {
  let storeData = stores.get(boxKey);
  if (!storeData) {
    log.debug(`New store '${boxKey}'`);
    storeData = { store: new Store(), refCount: 0 };
    stores.set(boxKey, storeData);
  }

  ++storeData.refCount;
  log.debug(`New ref to store '${boxKey}' (count=${storeData.refCount})`);
  return storeData.store;
}

export function releaseStore(boxKey: string) {
  const storeData = stores.get(boxKey);

  --storeData.refCount;
  log.debug(`Released ref to store '${boxKey}' (count=${storeData.refCount})`);

  if (storeData.refCount === 0) {
    log.debug(`Delete store '${boxKey}'`);
    stores.delete(boxKey);
  }
}