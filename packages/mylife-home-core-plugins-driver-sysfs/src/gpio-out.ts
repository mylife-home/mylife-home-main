import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';
import { Device } from './engine/device';

const log = logger.createLogger('mylife:home:core:plugins:driver-sysfs:gpio-out');

import m = components.metadata;

interface Configuration {
  readonly gpio: number;
  readonly activelow: boolean;
}

const CLASS_NAME = 'gpio';
const DEVICE_PREFIX = 'gpio';

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'gpio', type: m.ConfigType.INTEGER })
@m.config({ name: 'activelow', type: m.ConfigType.BOOL })
export class GpioOut {
  private readonly device: Device;
  private readonly reverse: boolean;

  constructor(config: Configuration) {
    this.device = new Device(CLASS_NAME, DEVICE_PREFIX, config.gpio);
    this.online = this.device.export();

    this.reverse = config.activelow;

    this.device.write('direction', 'out');
    this.setState();
  }

  destroy() {
    this.setState(false);
    this.device.close();
  }

  @m.state
  online: boolean = false;

  @m.state
  value: boolean = false;

  @m.action
  setValue(arg: boolean) {
    this.value = arg;
    this.setState();
  }

  private setState(value = this.value) {
    if (this.reverse) {
      value = !value;
    }
    
    this.device.write('value', value ? '1' : '0');
  }
}
