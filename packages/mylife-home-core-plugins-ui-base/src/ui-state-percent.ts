import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.UI })
export class UiStatePercent {

  @m.state({ type: new m.Range(0, 100) })
  value: number = 0;

  @m.action({ type: new m.Range(0, 100) })
  setValue(value: number) {
    this.value = value;
  }
}
