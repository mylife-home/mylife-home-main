import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class TemperatureToFloat {

  @m.state
  value: number = 0;

  @m.action({ type: new m.Range(17, 30) })
  setValue(value: number) {
    this.value = value;
  }
};
