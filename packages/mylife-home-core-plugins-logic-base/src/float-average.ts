import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'usedCount', type: m.ConfigType.INTEGER, description: 'Nombre d\'entrées qui sont utilisées (entre 0 et 8)' })
export class FloatAverage {
  private readonly usedCount: number;
  private readonly state: number[];

  constructor({ usedCount }: { usedCount: number; }) {
    this.usedCount = usedCount;
    this.state = new Array(this.usedCount).fill(NaN);
  }

  private set(index: number, arg: number) {
    if (index >= this.usedCount) {
      return;
    }

    this.state[index] = arg;

    if (this.state.length === 0) {
      this.value = NaN;
    } else {
      const sum = this.state.reduce((acc, value) => (nullToNaN(acc)  + value), 0);
      this.value = sum / this.state.length;
    }
  }

  @m.state
  value: number = NaN;

  @m.action
  set0(arg: number) {
    this.set(0, arg);
  }

  @m.action
  set1(arg: number) {
    this.set(1, arg);
  }

  @m.action
  set2(arg: number) {
    this.set(2, arg);
  }

  @m.action
  set3(arg: number) {
    this.set(3, arg);
  }

  @m.action
  set4(arg: number) {
    this.set(4, arg);
  }

  @m.action
  set5(arg: number) {
    this.set(5, arg);
  }

  @m.action
  set6(arg: number) {
    this.set(6, arg);
  }

  @m.action
  set7(arg: number) {
    this.set(7, arg);
  }
};

function nullToNaN(value: number) {
  return value === null ? NaN : value;
}