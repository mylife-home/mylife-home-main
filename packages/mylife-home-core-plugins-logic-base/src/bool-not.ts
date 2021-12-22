import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class BoolNot {

  @m.state
  value: boolean = false;

  @m.action
  set(arg: boolean) {
    this.value = !arg;
  }
};
