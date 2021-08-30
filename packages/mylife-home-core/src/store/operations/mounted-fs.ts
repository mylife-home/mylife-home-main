import path from 'path';
import { promises as fs } from 'fs';
import child_process from 'child_process';
import { logger } from 'mylife-home-common';
import { StoreOperations, StoreConfiguration } from '../common';
import { StoreItem } from '../model';

const log = logger.createLogger('mylife:home:core:store:mounted-fs');

interface MountedFsStoreConfiguration extends StoreConfiguration {
  readonly path: string;
  readonly mountPoint: string;
}

export class MountedFsStoreOperations implements StoreOperations {
  private readonly storeFile: string;
  private readonly mountPoint: string;

  constructor(configuration: StoreConfiguration) {
    const typedConfig = configuration as MountedFsStoreConfiguration;
    this.storeFile = path.resolve(typedConfig.path);
    this.mountPoint = typedConfig.mountPoint;
  }

  async load() {
    const content = await fs.readFile(this.storeFile, 'utf-8');
    return JSON.parse(content) as StoreItem[];
  }

  async save(items: StoreItem[]) {
    const content = JSON.stringify(items, null, 2);
    await exec(`mount -o remount,rw ${this.mountPoint}`);
    try {
      await fs.writeFile(this.storeFile, content);
    } finally {
      await exec(`mount -o remount,ro ${this.mountPoint}`);
    }
  }
}

async function exec(command: string) {
  log.debug(`Running command '${command}'`);
  await new Promise<void>((resolve, reject) => {
    child_process.exec(command, (error) => error ? reject(error) : resolve());
  });
  log.debug(`Command '${command}': success`);
}