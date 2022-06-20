import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
export class ValuePercent {
  private readonly toggleThreshold: number;

  constructor({ toggleThreshold }: { toggleThreshold: number; }) {
    this.toggleThreshold = toggleThreshold;
  }

  @m.state({ type: new m.Range(0, 100) })
  value: number = 0;

  @m.action({ type: new m.Range(0, 100) })
  setValue(arg: number) {
    this.value = arg;
  }

  @m.action({ type: new m.Range(-1, 100) })
  setPulse(arg: number) {
    if (arg !== -1) {
      this.value = arg;
    }
  }

  @m.action
  on(arg: boolean) {
    if (arg) {
      this.value = 100;
    }
  }

  @m.action
  off(arg: boolean) {
    if (arg) {
      this.value = 0;
    }
  }

  @m.action
  toggle(arg: boolean) {
    if (arg) {
      this.value = this.value < this.toggleThreshold ? 100 : 0;
    }
  }
};
