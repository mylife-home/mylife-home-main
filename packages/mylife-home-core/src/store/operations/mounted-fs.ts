import { StoreOperations, StoreItem } from '../common';

export class MountedFsStoreOperations implements StoreOperations {
  constructor() {
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