import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'initial', type: m.ConfigType.INTEGER })
export class TemperatureSelector {
  constructor({ initial }: { initial: number; }) {
    this.value = initial;
  }

  @m.state({ type: new m.Range(17, 30) })
  value: number;

  @m.action
  up(arg: boolean) {
    if (arg) {
      this.value = Math.min(this.value + 1, 30);
    }
  }

  @m.action
  down(arg: boolean) {
    if (arg) {
      this.value = Math.max(this.value - 1, 17);
    }
  }
};
