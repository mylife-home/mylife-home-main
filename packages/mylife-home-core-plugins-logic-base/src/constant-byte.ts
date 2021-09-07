import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'value', type: m.ConfigType.INTEGER })
export class ConstantByte {
  constructor({ value }: { value: number; }) {
    if (value < 0) { value = 0; }
    if (value > 255) { value = 255; }
    this.value = value;
  }

  @m.state({ type: new m.Range(0, 255) })
  value: number;
};
