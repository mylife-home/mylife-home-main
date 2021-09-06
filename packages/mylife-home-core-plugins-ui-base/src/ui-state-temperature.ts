import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.UI })
export class UiStateTemperature {

  @m.state({ type: new m.Float() })
  value: number = 0;

  @m.action({ type: new m.Float() })
  action(value: number) {
    this.value = value;
  }
}
