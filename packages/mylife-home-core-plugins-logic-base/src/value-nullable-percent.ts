import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class ValueNullablePercent {

  @m.state({ type: new m.Range(-1, 100) })
  value: number = -1;

  @m.action({ type: new m.Range(-1, 100) })
  setValue(arg: number) {
    this.value = arg;
  }
};
