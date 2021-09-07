import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'low', type: m.ConfigType.INTEGER })
@m.config({ name: 'high', type: m.ConfigType.INTEGER })
export class BinaryToPercent {
  private readonly low: number;
  private readonly high: number;

  constructor({ low, high }: { low: number; high: number; }) {

    this.low = low;
    this.high = high;

    this.value = this.low;
  }

  @m.state({ type: new m.Range(0, 100) })
  value: number;

  @m.action
  setValue(value: boolean) {
    this.value = value ? this.high : this.low;
  }
};
