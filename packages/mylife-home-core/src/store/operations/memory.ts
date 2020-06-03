import { StoreOperations, StoreItem, StoreConfiguration } from '../common';

interface MemoryStoreConfiguration extends StoreConfiguration {
  // keep it hackable for testing
  readonly items: StoreItem[];
}

export class MemoryStoreOperations implements StoreOperations {
  private readonly items: StoreItem[];

  constructor(configuration: StoreConfiguration) {
    const typedConfig = configuration as MemoryStoreConfiguration;
    this.items = typedConfig.items;
  }

  async load() {
    return this.items;
  }

  async save(items: StoreItem[]) {
    this.items.splice(0, this.items.length);
    if (items.length) {
      this.items.push(...items);
    }
  }
}
