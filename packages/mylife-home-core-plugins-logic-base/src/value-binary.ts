import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class ValueBinary {

  @m.state
  value: boolean = false;

  @m.action
  setValue(arg: boolean) {
    this.value = arg;
  }
};
