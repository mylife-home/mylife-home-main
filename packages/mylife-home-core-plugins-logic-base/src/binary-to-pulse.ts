import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class BinaryToPulse {

  @m.state
  off: boolean = false;

  @m.state
  on: boolean = false;

  @m.action
  action(value: boolean) {
    if (value) {
      this.on = true;
      this.on = false;
    } else {
      this.off = true;
      this.off = false;
    }
  }
};
