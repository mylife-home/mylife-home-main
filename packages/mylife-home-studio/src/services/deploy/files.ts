import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import chokidar, { FSWatcher } from 'chokidar';
import { logger } from 'mylife-home-common';
import * as directories from './directories';
import { FileInfo } from '../../../shared/deploy';

const log = logger.createLogger('mylife:home:studio:services:deploy:files');

export class Files extends EventEmitter {
  private readonly files = new Map<string, FileInfo>();
  private watcher: FSWatcher;

  async init() {
    log.debug(`loading files info in: ${directories.files()}`);

    await fs.ensureDir(directories.files());

    for (const file of await fs.readdir(directories.files())) {
      const fullPath = path.join(directories.files(), file);
      const stats = await fs.stat(fullPath);

      this.setFile(fullPath, stats);
    }

    log.info(`${this.files.size} files info loaded`);

    this.watcher = chokidar.watch(directories.files(), { usePolling: true });
    this.watcher.on('error', this.handleError);
    this.watcher.on('all', this.handleEvent);
  }

  async terminate() {
    await this.watcher.close();
  }

  private readonly handleError = (err: Error) => {
    log.error(err, 'Got error from FsWatcher');
  };

  private readonly handleEvent = (eventName: string, fullPath: string, stats?: fs.Stats) => {
    switch (eventName) {
      case 'add':
      case 'change':
        this.setFile(fullPath, stats);
        break;

      case 'unlink':
        this.unsetFile(fullPath);
        break;
    }
  };

  private setFile(fullPath: string, stats: fs.Stats) {
    if (!stats || !stats.isFile()) {
      return;
    }

    const name = path.basename(fullPath);
    const file = {
      id: name,
      size: stats.size,
      modifiedDate: stats.mtimeMs,
    };

    const isUpdate = this.files.has(name);
    this.files.set(name, file);

    if (isUpdate) {
      log.debug(`File updated: '${name}'`);
      this.emit('file-updated', name);
    } else {
      log.debug(`File created: '${name}'`);
      this.emit('file-created', name);
    }
  }

  private unsetFile(fullPath: string) {
    const name = path.basename(fullPath);
    if (this.files.delete(name)) {
      log.debug(`File deleted: '${name}'`);
      this.emit('file-deleted', name);
    }
  }

  listFiles() {
    return Array.from(this.files.values());
  }

  getFile(id: string) {
    return this.files.get(id);
  }
}
