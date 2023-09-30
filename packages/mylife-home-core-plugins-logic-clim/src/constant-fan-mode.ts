import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'value', type: m.ConfigType.STRING })
export class ConstantFanMode {
  constructor({ value }: { value: string; }) {
    this.value = value;
  }

  @m.state({ type: new m.Enum('auto', 'high', 'low', 'medium', 'quiet') })
  value: string;
};
