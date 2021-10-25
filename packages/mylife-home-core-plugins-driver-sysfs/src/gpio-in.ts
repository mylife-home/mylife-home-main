import { components } from 'mylife-home-core';
import { Device } from './engine/device';

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
export class GpioIn {
  private readonly device: Device;
  private readonly reverse: boolean;

  constructor(config: Configuration) {
    this.device = new Device(CLASS_NAME, DEVICE_PREFIX, config.gpio);
    this.online = this.device.export();

    this.reverse = config.activelow;

    this.device.write('direction', 'in');
    this.device.write('edge', 'both');

    this.device.poll('value', this.onValueChange);
  }

  destroy() {
    this.device.close();
  }

  @m.state
  online: boolean = false;

  @m.state
  value: boolean = false;

  private readonly onValueChange = (data: string) => {
    let value = data === '1';

    if(this.reverse) {
      value = !value;
    }

    this.value = value;
  };
}
