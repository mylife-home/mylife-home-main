import { StoreOperations, StoreConfiguration } from '../common';
import { StoreItem } from '../model';

interface MountedFsStoreConfiguration extends StoreConfiguration {
}

export class MountedFsStoreOperations implements StoreOperations {
  constructor(configuration: StoreConfiguration) {
    const typedConfig = configuration as MountedFsStoreConfiguration;
    throw new Error('TODO');
  }

  async load() {
    throw new Error('TODO');
    const array: StoreItem[] = [];
    return array;
  }

  async save(items: StoreItem[]) {
    throw new Error('TODO');
  }
}