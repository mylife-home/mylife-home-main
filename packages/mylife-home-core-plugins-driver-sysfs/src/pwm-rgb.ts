import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';
import { Device } from './engine/device';

const log = logger.createLogger('mylife:home:core:plugins:driver-sysfs:pwm-rgb');

import m = components.metadata;

interface Configuration {
  readonly redGpio: number;
  readonly greenGpio: number;
  readonly blueGpio: number;
}

const CLASS_NAME = 'dma_pwm';
const DEVICE_PREFIX = 'pwm';

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'redGpio', type: m.ConfigType.INTEGER })
@m.config({ name: 'greenGpio', type: m.ConfigType.INTEGER })
@m.config({ name: 'blueGpio', type: m.ConfigType.INTEGER })
export class PwmRgb {

  constructor(config: Configuration) {
  }

  destroy() {
  }

  @m.state
  online: boolean = false;

  @m.state
  active: boolean = false;

  @m.state({ type: new m.Range(0, 16777215) })
  color: number = 0;
  
  @m.action
  setActive(arg: boolean) {

  }
  
  @m.action({ type: new m.Range(0, 16777215) })
  setColor(arg: number) {

  }
}
