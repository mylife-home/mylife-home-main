import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'usedCount', type: m.ConfigType.INTEGER, description: 'Nombre d\'entrées qui sont utilisées (entre 0 et 8)' })
export class BoolAnd {
  private readonly usedCount: number;
  private readonly state: boolean[];

  constructor({ usedCount }: { usedCount: number; }) {
    this.usedCount = usedCount;
    this.state = new Array(this.usedCount).fill(false);
  }

  private set(index: number, arg: boolean) {
    if (index >= this.usedCount) {
      return;
    }

    this.state[index] = arg;
    this.value = this.state.every(val => val);
  }

  @m.state
  value: boolean = false;

  @m.action
  set0(arg: boolean) {
    this.set(0, arg);
  }

  @m.action
  set1(arg: boolean) {
    this.set(1, arg);
  }

  @m.action
  set2(arg: boolean) {
    this.set(2, arg);
  }

  @m.action
  set3(arg: boolean) {
    this.set(3, arg);
  }

  @m.action
  set4(arg: boolean) {
    this.set(4, arg);
  }

  @m.action
  set5(arg: boolean) {
    this.set(5, arg);
  }

  @m.action
  set6(arg: boolean) {
    this.set(6, arg);
  }

  @m.action
  set7(arg: boolean) {
    this.set(7, arg);
  }
};
