import { EventEmitter } from 'events';
import fs from 'fs-extra';
import path from 'path';
import { logger } from 'mylife-home-common';
import chokidar, { FSWatcher } from 'chokidar';

const log = logger.createLogger('mylife:home:studio:services:deploy:pins');

export class Pins extends EventEmitter {
  private readonly pins = new Set<string>();
  private watcher: FSWatcher;
  private filePath: string;

  init(filePath: string) {
    this.filePath = filePath;
    
    log.info(`Starting pins in '${this.filePath}'`);

    fs.ensureDirSync(path.parse(this.filePath).dir);

    this.watcher = chokidar.watch(this.filePath, { usePolling: true, ignoreInitial: false });
    this.watcher.on('error', this.handleError);
    this.watcher.on('all', this.handleEvent);
  }

  async terminate() {
    log.info(`Terminating pins in '${this.filePath}'`);

    await this.watcher.close();
  }

  private readonly handleError = (err: Error) => {
    log.error(err, 'Got error from FsWatcher');
  };

  private readonly handleEvent = (eventName: string, fullPath: string, stats?: fs.Stats) => {
    try {
      if (fullPath !== this.filePath) {
        log.debug(`Unhandled fs path: '${eventName}' on '${fullPath}'`);
        return;
      }

      switch (eventName) {
        case 'add':
        case 'change':
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          this.handleNewContent(content);
          break;

        case 'unlink':
          this.handleNewContent([]);
          break;

        default:
          log.debug(`Unhandled fs event: '${eventName}' on '${fullPath}'`);
          break;
      }
    } catch (err) {
      log.error(err, `Error handling fs event: '${eventName}' on '${fullPath}'`);
    }
  };

  private handleNewContent(content: string[]) {
    const newPins = new Set(content);

    for (const id of this.pins) {
      if (!newPins.has(id)) {
        this.pins.delete(id);
        this.emit('pin', id, false);
      }
    }

    for(const id of newPins) {
      if (!this.pins.has(id)) {
        this.pins.add(id);
        this.emit('pin', id, true);
      }
    }
  }

  pin(id: string, value: boolean) {
    const oldValue = this.pins.has(id);
    if (value === oldValue) {
      return;
    }

    if (value) {
      this.pins.add(id);
    } else {
      this.pins.delete(id);
    }

    fs.writeFileSync(this.filePath, JSON.stringify(Array.from(this.pins), null, 2));

    this.emit('pin', id, value);
  }

  isPinned(id: string) {
    return this.pins.has(id);
  }
}