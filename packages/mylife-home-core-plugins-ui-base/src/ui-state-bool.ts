import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.UI })
export class UiStateBool {

  @m.state
  value: boolean = false;

  @m.action
  setValue(value: boolean) {
    this.value = value;
  }
}
