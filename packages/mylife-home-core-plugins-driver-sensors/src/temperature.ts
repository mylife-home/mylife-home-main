import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';
import * as ds18b20 from './engine/ds18b20';

const log = logger.createLogger('mylife:home:core:plugins:driver-sensors:temperature');

import m = components.metadata;

interface Configuration {
  readonly sensorId: string;
}

@m.plugin({ usage: m.PluginUsage.SENSOR })
@m.config({ name: 'sensorId', type: m.ConfigType.STRING })
export class Temperature {
  private readonly sensorId: string;
  private end = false;
  private worker: NodeJS.Timeout;

  constructor(config: Configuration) {
    this.sensorId = config.sensorId;
    this.worker = setInterval(this.read, 10000);
    this.read();
  }

  destroy() {
    this.end = true;
    clearInterval(this.worker);
  }

  @m.state({ type: new m.Float() })
  value: number = -1000;

  private readonly read = async () => {
    try {
      const value = await ds18b20.temperature(this.sensorId);

      if (this.end) {
        return;
      }

      // round at 1 decimal
      this.value = Math.round(value * 10) / 10;
    } catch (err) {
      log.error(err, `Error reading temperature on sensor ID '${this.sensorId}'`);
    }
  };
}
