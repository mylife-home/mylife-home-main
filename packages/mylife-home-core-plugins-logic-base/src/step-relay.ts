import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class StepRelay {

  @m.state
  value: boolean = false;

  @m.action
  action(arg: boolean) {
    if (arg) {
      this.value = !this.value;
    }
  }

  @m.action
  on(arg: boolean) {
    if (arg) {
      this.value = true;
    }
  }

  @m.action
  off(arg: boolean) {
    if (arg) {
      this.value = false;
    }
  }
};
