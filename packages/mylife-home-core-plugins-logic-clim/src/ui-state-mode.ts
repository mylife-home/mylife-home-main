import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.UI })
export class UiStateMode {

  @m.state({ type: new m.Enum('cool', 'dry', 'fan-only', 'heat', 'heat-cool', 'off') })
  value: string = 'off';

  @m.action({ type: new m.Enum('cool', 'dry', 'fan-only', 'heat', 'heat-cool', 'off') })
  setValue(value: string) {
    this.value = value;
  }
}
