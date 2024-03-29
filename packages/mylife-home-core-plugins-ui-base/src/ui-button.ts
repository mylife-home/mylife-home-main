import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.UI })
export class UiButton {

  @m.state
  value: boolean = false;

  @m.action
  action(value: boolean) {
    this.value = value;
  }
}
