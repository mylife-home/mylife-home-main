import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'threshold', type: m.ConfigType.INTEGER })
export class PercentToBinary {
  private readonly threshold: number;

  constructor({ threshold }: { threshold: number; }) {
    this.threshold  = threshold;
  }

  @m.state
  value: boolean = false;

  @m.action({ type: new m.Range(0, 100) })
  setValue(arg: number) {
    this.value = arg >= this.threshold;
  }
};
