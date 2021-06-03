import path from 'path';
import { promises as fs } from 'fs';
import { StoreOperations, StoreConfiguration } from '../common';
import { StoreItem } from '../model';

interface FsStoreConfiguration extends StoreConfiguration {
  readonly path: string;
}

export class FsStoreOperations implements StoreOperations {
  private readonly storeFile: string;

  constructor(configuration: StoreConfiguration) {
    const typedConfig = configuration as FsStoreConfiguration;
    this.storeFile = path.resolve(typedConfig.path);
  }

  async load() {
    const content = await fs.readFile(this.storeFile, 'utf-8');
    return JSON.parse(content) as StoreItem[];
  }

  async save(items: StoreItem[]) {
    const content = JSON.stringify(items);
    await fs.writeFile(this.storeFile, content);
  }
}
