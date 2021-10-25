import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';
import { Device } from './engine/device';

const log = logger.createLogger('mylife:home:core:plugins:driver-sysfs:ac-dimmer');

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
  }

  destroy() {
    if (this.online) {
      this.device.unexport();
    }
  }

  @m.state
  online: boolean = false;

  @m.state({ type : new m.Range(0, 100) })
  value: number = 0;

  @m.action({ type : new m.Range(0, 100) })
  setValue(arg: number) {

  }
}
