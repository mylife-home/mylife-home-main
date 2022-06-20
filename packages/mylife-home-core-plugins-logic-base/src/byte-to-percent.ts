import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class ByteToPercent {

  @m.state({ type: new m.Range(0, 100) })
  value: number = 0;

  @m.action({ type: new m.Range(0, 255) })
  setValue(arg: number) {
    this.value = Math.round(arg * 100 / 255);
  }
};
