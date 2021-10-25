import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';
import { Device } from './engine/device';

const log = logger.createLogger('mylife:home:core:plugins:driver-sysfs:gpio-in');

import m = components.metadata;

interface Configuration {
  readonly gpio: number;
  readonly activelow: boolean;
  readonly pull: string;
}

const CLASS_NAME = 'gpio';
const DEVICE_PREFIX = 'gpio';

@m.plugin({ usage: m.PluginUsage.SENSOR })
@m.config({ name: 'gpio', type: m.ConfigType.INTEGER })
@m.config({ name: 'activelow', type: m.ConfigType.BOOL })
@m.config({ name: 'pull', type: m.ConfigType.STRING, description: '"up" for pull up, "down" for pull down, anything else for no pull' })
export class GpioIn {
  private readonly device: Device;

  constructor(config: Configuration) {
    this.device = new Device(CLASS_NAME, DEVICE_PREFIX, config.gpio);
    this.online = this.device.export();
  }

  destroy() {
    if (this.online) {
      this.device.unexport();
    }
  }

  @m.state
  online: boolean = false;

  @m.state
  value: boolean = false;
}
