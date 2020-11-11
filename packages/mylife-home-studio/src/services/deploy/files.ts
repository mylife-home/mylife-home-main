import { EventEmitter } from 'events';
import fs from 'fs-extra';
import path from 'path';
import { logger } from 'mylife-home-common';
import * as directories from './directories';
import { FileInfo } from '../../../shared/deploy';

const log = logger.createLogger('mylife:home:studio:services:deploy:files');

export class Files extends EventEmitter {
  private readonly files = new Map<string, FileInfo>();

  async init() {
    log.debug(`loading files info in: ${directories.files()}`);

    await fs.ensureDir(directories.files());

    for (const file of await fs.readdir(directories.files())) {
      const fullname = path.join(directories.files(), file);
      const stats = await fs.stat(fullname);

      if (!stats.isFile()) {
        continue;
      }

      this.files.set(file, {
        id: file,
        size: stats.size,
        modifiedDate: stats.mtimeMs,
      });
    }

    log.info(`${this.files.size} files info loaded`);
  }

  async terminate() {}

  listFiles() {
    return Array.from(this.files.values());
  }

  getFile(id: string) {
    return this.files.get(id);
  }
}
