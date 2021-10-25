import { components } from 'mylife-home-core';
import { Device } from './engine/device';

import m = components.metadata;

interface Configuration {
  readonly gpio: number;
}

const CLASS_NAME = 'ac_dimmer';
const DEVICE_PREFIX = 'dimmer';

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'gpio', type: m.ConfigType.INTEGER })
export class AcDimmer {
  private readonly device: Device;

  constructor(config: Configuration) {
    this.device = new Device(CLASS_NAME, DEVICE_PREFIX, config.gpio);
    this.online = this.device.export();
    this.setState();
  }

  destroy() {
    this.setState(0);
    this.device.close();
  }

  @m.state
  online: boolean = false;

  @m.state({ type: new m.Range(0, 100) })
  value: number = 0;

  @m.action({ type: new m.Range(0, 100) })
  setValue(arg: number) {
    this.value = arg;
    this.setState();
  }

  private setState(value = this.value) {
    this.device.write('value', value);
  }
}
