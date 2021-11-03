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
  private readonly redDevice: Device;
  private readonly greenDevice: Device;
  private readonly blueDevice: Device;

  constructor(config: Configuration) {
    this.redDevice = new Device(CLASS_NAME, DEVICE_PREFIX, config.redGpio);
    this.greenDevice = new Device(CLASS_NAME, DEVICE_PREFIX, config.greenGpio);
    this.blueDevice = new Device(CLASS_NAME, DEVICE_PREFIX, config.blueGpio);

    this.redDevice.export();
    this.greenDevice.export();
    this.blueDevice.export();

    this.online = this.redDevice.exported && this.greenDevice.exported && this.blueDevice.exported;
    this.setState();
  }

  destroy() {
    this.setState(false);
    this.redDevice.close();
    this.greenDevice.close();
    this.blueDevice.close();
  }

  @m.state
  online: boolean = false;

  @m.state
  active: boolean = false;

  @m.state({ type: new m.Range(0, 16777215) })
  color: number = 0;

  @m.action
  setActive(arg: boolean) {
    this.active = arg;
    this.setState();
  }

  @m.action({ type: new m.Range(0, 16777215) })
  setColor(arg: number) {
    this.color = arg;
    this.setState();
  }

  private setState(active = this.active) {
    // avoid to make partial updates
    if (!this.online) {
      return;
    }

    if (!this.active) {
      log.info('OFF');
      this.redDevice.write('value', '0');
      this.greenDevice.write('value', '0');
      this.blueDevice.write('value', '0');
      return;
    }

    const red = Math.round((((this.color >> 16) & 255) * 100) / 255);
    const green = Math.round((((this.color >> 8) & 255) * 100) / 255);
    const blue = Math.round(((this.color & 255) * 100) / 255);

    log.info(`Red=${red}, Green=${green}, Blue=${blue}`);

    this.redDevice.write('value', `${red}`);
    this.greenDevice.write('value', `${green}`);
    this.blueDevice.write('value', `${blue}`);
  }
}
