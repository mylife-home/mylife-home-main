import path from 'path';
import fs from 'fs';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-sysfs:engine:device');

export class Device {
  constructor(private readonly className: string, private readonly devicePrefix: string, private readonly gpio: number) {}

  private classPath(...parts: string[]) {
    return path.join('/sys/class', this.className, ...parts);
  }

  private devicePath(...parts: string[]) {
    return this.classPath(`${this.devicePrefix}${this.gpio}`, ...parts);
  }

  export() {
    const exportPath = this.classPath('export');
    try {
      fs.writeFileSync(exportPath, `${this.gpio}`);
      return true;
    } catch (err) {
      log.error(err, `Could not export (path='${exportPath}', gpio='${this.gpio}'`);
      return false;
    }
  }

  unexport() {
    const exportPath = this.classPath('unexport');
    try {
      fs.writeFileSync(exportPath, `${this.gpio}`);
      return true;
    } catch (err) {
      log.error(err, `Could not unexport (path='${exportPath}', gpio='${this.gpio}'`);
      return false;
    }
  }
}
