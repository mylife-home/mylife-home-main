import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'trueValue', type: m.ConfigType.STRING })
export class ModeToBool {
  private readonly trueValue: string;

  constructor({ trueValue }: { trueValue: string; }) {
    this.trueValue = trueValue;
  }

  @m.state
  value: boolean = false;

  @m.action({ type: new m.Enum('cool', 'dry', 'fan-only', 'heat', 'heat-cool', 'off') })
  setValue(value: string) {
    this.value = value == this.trueValue;
  }
};
