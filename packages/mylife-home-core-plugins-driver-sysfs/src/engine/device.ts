import path from 'path';
import fs from 'fs';
import { logger } from 'mylife-home-common';
import * as poll from './poll';

const log = logger.createLogger('mylife:home:core:plugins:driver-sysfs:engine:device');

export class Device {
  private _exported = false;
  private pollers: Poller[];

  constructor(private readonly className: string, private readonly devicePrefix: string, private readonly gpio: number) {}

  private classPath(...parts: string[]) {
    return path.join('/sys/class', this.className, ...parts);
  }

  private devicePath(...parts: string[]) {
    return this.classPath(`${this.devicePrefix}${this.gpio}`, ...parts);
  }

  private deviceName() {
    return `${this.className}/${this.devicePrefix}${this.gpio}`;
  }

  get exported() {
    return this._exported;
  }

  export() {
    const exportPath = this.classPath('export');
    try {
      fs.appendFileSync(exportPath, `${this.gpio}`);
      this._exported = true;
    } catch (err) {
      log.error(err, `Could not export (path='${exportPath}', gpio='${this.gpio}'`);
      this._exported = false;
    }

    return this._exported;
  }

  close() {
    if (!this._exported) {
      return;
    }

    this.unexport();
    this._exported = false;

    let poller: Poller;
    while ((poller = this.pollers.pop())) {
      poller.close();
    }
  }

  private unexport() {
    const exportPath = this.classPath('unexport');
    try {
      fs.appendFileSync(exportPath, `${this.gpio}`);
      return true;
    } catch (err) {
      log.error(err, `Could not unexport (path='${exportPath}', gpio='${this.gpio}'`);
      return false;
    }
  }

  write(attribute: string, value: string) {
    if (!this._exported) {
      log.debug(`Could not write attribute because device is not exported (device='${this.deviceName}', attribute='${attribute}', value='${value}')`);
      return;
    }

    const attributePath = this.devicePath(attribute);
    try {
      fs.appendFileSync(attributePath, value);
    } catch (err) {
      log.error(err, `Could not write attribute (path='${attributePath}', value='${value}'`);
    }
  }

  poll(attribute: string, callback: (value: string) => void) {
    if (!this._exported) {
      log.debug(`Could not poll attribute because device is not exported (device='${this.deviceName}', attribute='${attribute}')`);
      return;
    }

    const attributePath = this.devicePath(attribute);
    this.pollers.push(new Poller(attributePath, callback));
  }
}

class Poller {
  private readonly fd: number;

  constructor(private readonly fileName: string, private readonly callback: (value: string) => void) {
    this.fd = fs.openSync(fileName, 'r');
    poll.register(this.fd, this.pollCallback);

    // trigger it to read first value
    this.pollCallback();
  }

  close() {
    poll.unregister(this.fd);
    fs.closeSync(this.fd);
  }

  private readonly pollCallback = () => {
    try {
      // Note: sysfs values cannot be more than PAGE_SIZE long
      // Note: make the buffer reusable
      const buffer = Buffer.allocUnsafe(4096);
      const len = fs.readSync(this.fd, buffer, 0, buffer.length, 0);
      const value = buffer.slice(0, len).toString();

      this.callback(value);
    } catch (err) {
      log.error(err, `Could not handle trigger (fileName='${this.fileName}'`);
    }
  };
}
