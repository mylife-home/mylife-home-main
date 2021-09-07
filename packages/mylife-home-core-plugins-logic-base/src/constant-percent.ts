import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'value', type: m.ConfigType.INTEGER })
export class ConstantPercent {
  constructor({ value }: { value: number; }) {
    if (value < 0) { value = 0; }
    if (value > 100) { value = 100; }
    this.value = value;
  }

  @m.state({ type: new m.Range(0, 100) })
  value: number;
};
