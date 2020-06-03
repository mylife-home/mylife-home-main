import { StoreOperations, StoreItem, StoreConfiguration } from '../common';

interface FsStoreConfiguration extends StoreConfiguration {
  readonly path: string;
}

export class FsStoreOperations implements StoreOperations {
  constructor(configuration: StoreConfiguration) {
    const typedConfig = configuration as FsStoreConfiguration;
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