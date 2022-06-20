import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class PercentToByte {

  @m.state({ type: new m.Range(0, 255) })
  value: number = 0;

  @m.action({ type: new m.Range(0, 100) })
  setValue(arg: number) {
    this.value = Math.round(arg * 255 / 100);
  }
};
