import path from 'path';
import { EventEmitter } from 'events';
import chokidar, { FSWatcher } from 'chokidar';
import fs from 'fs-extra';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:studio:utils:fs-collection');

export type ChangeType = 'internal' | 'external';


interface Item<TContent> {
  raw: Buffer;
  content: TContent;
}

export declare interface FsCollection<TContent> {
  on(event: 'create', listener: (id: string, type: ChangeType) => void): this;
  on(event: 'update', listener: (id: string, type: ChangeType) => void): this;
  on(event: 'delete', listener: (id: string, type: ChangeType) => void): this;
  on(event: 'rename', listener: (id: string, newId: string, type: ChangeType) => void): this;
}

export class FsCollection<TContent> extends EventEmitter {
  private readonly items = new Map<string, Item<TContent>>();
  private watcher: FSWatcher;
  private directory: string;

  init(directory: string) {
    this.directory = directory;
    
    log.info(`Starting fs collection in '${this.directory}'`);

    fs.ensureDirSync(directory);

    this.watcher = chokidar.watch(this.directory, { usePolling: true, ignoreInitial: false });
    this.watcher.on('error', this.handleError);
    this.watcher.on('all', this.handleEvent);
  }

  async terminate() {
    log.info(`Terminating fs collection in '${this.directory}'`);

    await this.watcher.close();
  }

  private readonly handleError = (err: Error) => {
    log.error(err, 'Got error from FsWatcher');
  };

  private readonly handleEvent = (eventName: string, fullPath: string, stats?: fs.Stats) => {
    try {
      switch (eventName) {
        case 'add':
        case 'change':
          if (stats && stats.isFile()) {
            this.handleSet(fullPath);
          }
          break;

        case 'unlink':
          this.handleDelete(fullPath);
          break;

        // Note: cannot detect renames

        default:
          log.debug(`Unhandled fs event: '${eventName}' on '${fullPath}'`);
          break;
      }
    } catch (err) {
      log.error(err, `Error handling fs event: '${eventName}' on '${fullPath}'`);
    }
  };

  private handleSet(fullPath: string) {
    const id = path.parse(fullPath).name;
    const raw = fs.readFileSync(fullPath);

    // Check if there is actualy an update
    const existing = this.items.get(id);
    if (existing && existing.raw.equals(raw)) {
      log.debug(`Ignored set '${id}'`);
      return;
    }

    const exists = !!existing;
    const content: TContent = JSON.parse(raw.toString('utf-8'));
    this.items.set(id, { raw, content });
    log.info(`Item set: '${id}' (exists=${exists}, external)`);

    this.emit(exists ? 'update' : 'create', id, 'external');
  }

  private handleDelete(fullPath: string) {
    const id = path.parse(fullPath).name;
    if (!this.items.get(id)) {
      log.debug(`Ignored delete '${id}'`);
    }

    this.items.delete(id);
    log.info(`Item deleted: '${id}' (external)`);

    this.emit('delete', id, 'external');
  }

  set(id: string, content: TContent) {
    if (!content) {
      throw new Error(`Cannot set an item without content: '${id}'`);
    }

    const exists = !!this.items.get(id);

    const raw = Buffer.from(JSON.stringify(content, null, 2));
    fs.writeFileSync(this.buildPath(id), raw);
    this.items.set(id, { raw, content });
    log.info(`Item set: '${id}' (exists=${exists}, internal)`);

    this.emit(exists ? 'update' : 'create', id, 'internal');
  }

  create(id: string, content: TContent) {
    if (this.items.get(id)) {
      throw new Error(`Item does already exist: '${id}'`);
    }

    this.set(id, content);
  }

  update(id: string, content: TContent) {
    if (!this.items.get(id)) {
      throw new Error(`Item does not exist: '${id}'`);
    }
    
    this.set(id, content);
  }

  delete(id: string) {
    if (!this.items.get(id)) {
      throw new Error(`Item does not exist: '${id}'`);
    }

    fs.unlinkSync(this.buildPath(id));
    this.items.delete(id);
    log.info(`Item deleted: '${id}' (internal)`);

    this.emit('delete', id, 'internal');
  }

  rename(id: string, newId: string) {
    const item = this.items.get(id);
    if (!this.items.get(id)) {
      throw new Error(`Item does not exist: '${id}'`);
    }

    if (this.items.get(newId)) {
      throw new Error(`Item does already exist: '${newId}'`);
    }

    fs.renameSync(this.buildPath(id), this.buildPath(newId));
    this.items.delete(id);
    this.items.set(newId, item);
    log.info(`Item renamed: '${id}' => '${newId}'`);

    this.emit('rename', id, newId, 'internal');
  }

  private buildPath(id: string) {
    return path.join(this.directory, id + '.json');
  }

  ids() {
    return Array.from(this.items.keys());
  }

  has(id: string) {
    return this.items.has(id);
  }

  // No copy!
  get(id: string) {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Item not found: '${id}'`);
    }

    return item.content;
  }
}
