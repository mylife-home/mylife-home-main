import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.UI })
export class UiStateNullablePercent {

  @m.state({ type: new m.Range(-1, 100) })
  value: number = -1;

  @m.action({ type: new m.Range(-1, 100) })
  setValue(value: number) {
    this.value = value;
  }
}
