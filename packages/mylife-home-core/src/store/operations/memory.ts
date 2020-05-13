import { StoreOperations, StoreItem } from '../common';

export class MemoryStoreOperations implements StoreOperations {
  // keep it hackable for testing
  items: StoreItem[] = [];

  async load() {
    return this.items;
  }

  async save(items: StoreItem[]) {
    this.items = items;
  }
}