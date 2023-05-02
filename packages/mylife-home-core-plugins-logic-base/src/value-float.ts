import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class ValueFloat {

  @m.state
  value: number = NaN;

  @m.action
  setValue(arg: number) {
    this.value = arg;
  }
};
