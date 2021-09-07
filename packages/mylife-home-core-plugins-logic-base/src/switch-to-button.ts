import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class SwitchToButton {

  private switch_ = false;

  @m.state
  value: boolean = false;

  @m.action
  action(arg: boolean) {
    if (this.switch_ === arg) {
      return;
    }

    this.switch_ = arg;

    this.value = true;
    this.value = false;
  }
};
