import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import chokidar, { FSWatcher } from 'chokidar';
import { logger } from 'mylife-home-common';
import { FileInfo } from '../../../shared/deploy';

const log = logger.createLogger('mylife:home:studio:services:deploy:files');

const OPEN_FLAGS = {
  read: fs.constants.O_RDONLY,
  init: fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC,
  append: fs.constants.O_WRONLY | fs.constants.O_APPEND,
};

export class Files extends EventEmitter {
  private readonly files = new Map<string, FileInfo>();
  private watcher: FSWatcher;
  private directory: string;

  async init(directory: string) {
    this.directory = directory;
    log.debug(`loading files info in: ${this.directory}`);

    await fs.ensureDir(this.directory);

    this.watcher = chokidar.watch(this.directory, { usePolling: true, ignoreInitial: false });
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
      this.emit('update', name);
    } else {
      log.debug(`File created: '${name}'`);
      this.emit('create', name);
    }
  }

  private unsetFile(fullPath: string) {
    const name = path.basename(fullPath);
    if (this.files.delete(name)) {
      log.debug(`File deleted: '${name}'`);
      this.emit('delete', name);
    }
  }

  listFiles() {
    return Array.from(this.files.values());
  }

  getFile(id: string) {
    return this.files.get(id);
  }

  async delete(id: string) {
    const fullPath = path.join(this.directory, id);
    await fs.unlink(fullPath);
  }

  async rename(id: string, newId: string) {
    const fullPath = path.join(this.directory, id);
    const newFullPath = path.join(this.directory, newId);
    await fs.rename(fullPath, newFullPath);
  }

  async read(id: string, offset: number, size: number) {
    const fullPath = path.join(this.directory, id);
    const buffer = Buffer.allocUnsafe(size);
    let readSize;

    const fd = await fs.open(fullPath, OPEN_FLAGS.read);
    try {
      const { bytesRead } = await fs.read(fd, buffer, 0, size, offset);
      readSize = bytesRead;
    } finally {
      await fs.close(fd);
    }

    return buffer.slice(0, readSize);
  }

  async write(id: string, buffer: Buffer, type: 'init' | 'append') {
    const fullPath = path.join(this.directory, id);
    let writeSize;

    const fd = await fs.open(fullPath, OPEN_FLAGS[type]);
    try {
      const { bytesWritten } = await fs.write(fd, buffer);
      writeSize = bytesWritten;
    } finally {
      await fs.close(fd);
    }

    if (writeSize !== buffer.length) {
      throw new Error(`Write succeeded but write size (${writeSize}) different than buffer size (${buffer.length})`);
    }
  }
}
