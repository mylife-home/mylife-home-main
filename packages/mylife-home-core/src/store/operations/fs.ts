import { StoreOperations, StoreItem, StoreConfiguration } from '../common';
import { promises as fs } from 'fs';

interface FsStoreConfiguration extends StoreConfiguration {
  readonly path: string;
}

export class FsStoreOperations implements StoreOperations {
  private readonly path: string;

  constructor(configuration: StoreConfiguration) {
    const typedConfig = configuration as FsStoreConfiguration;
    this.path = typedConfig.path;
  }

  async load() {
    const content = await fs.readFile(this.path, 'utf-8');
    return JSON.parse(content) as StoreItem[];
  }

  async save(items: StoreItem[]) {
    const content = JSON.stringify(items);
    await fs.writeFile(this.path, content);
  }
}
