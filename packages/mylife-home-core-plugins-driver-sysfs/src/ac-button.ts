import { components } from 'mylife-home-core';
import { Device } from './engine/device';

import m = components.metadata;

interface Configuration {
  readonly gpio: number;
}

const CLASS_NAME = 'ac_button';
const DEVICE_PREFIX = 'button';

@m.plugin({ usage: m.PluginUsage.SENSOR })
@m.config({ name: 'gpio', type: m.ConfigType.INTEGER })
export class AcButton {
  private readonly device: Device;

  constructor(config: Configuration) {
    this.device = new Device(CLASS_NAME, DEVICE_PREFIX, config.gpio);
    this.online = this.device.export();

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
    this.value = data === '1';
  };
}
