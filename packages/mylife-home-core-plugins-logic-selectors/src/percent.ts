import { components } from 'mylife-home-core';

import m = components.metadata;

interface Config {
  value0: number;
  value1: number;
  value2: number;
  value3: number;
  value4: number;
  value5: number;
  value6: number;
  value7: number;
  value8: number;
  value9: number;
  step: number;
}

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'value0', type: m.ConfigType.INTEGER })
@m.config({ name: 'value1', type: m.ConfigType.INTEGER })
@m.config({ name: 'value2', type: m.ConfigType.INTEGER })
@m.config({ name: 'value3', type: m.ConfigType.INTEGER })
@m.config({ name: 'value4', type: m.ConfigType.INTEGER })
@m.config({ name: 'value5', type: m.ConfigType.INTEGER })
@m.config({ name: 'value6', type: m.ConfigType.INTEGER })
@m.config({ name: 'value7', type: m.ConfigType.INTEGER })
@m.config({ name: 'value8', type: m.ConfigType.INTEGER })
@m.config({ name: 'value9', type: m.ConfigType.INTEGER })
@m.config({ name: 'step', type: m.ConfigType.INTEGER })
export class Percent {
  private readonly values: number[] = [];
  private readonly step: number;
  private loopbackValue = 0;

  constructor(config: Config) {

    for (let i = 0; i < 10; ++i) {
      this.values.push(configInt(config[`value${i}` as keyof Config], 0, 100, -1));
    }

    this.step = configInt(config.step, 1, 100, 1);
    this.value = -1;

    this.step = config.step;
  }

  @m.state({ type: new m.Range(-1, 100) })
  value: number = -1;

  @m.action({ type: new m.Range(0, 100) })
  setValue(value: number) {
    this.loopbackValue = value;
  }

  @m.action
  up(arg: boolean) {
    if (arg) {
      const value = Math.min(this.loopbackValue + this.step, 100);
      this.changeValue(value);
    }
  }

  @m.action
  down(arg: boolean) {
    if (arg) {
      const value = Math.max(this.loopbackValue - this.step, 0);
      this.changeValue(value);
    }
  }

  @m.action set0(arg: boolean) { this.setX(0, arg); }
  @m.action set1(arg: boolean) { this.setX(1, arg); }
  @m.action set2(arg: boolean) { this.setX(2, arg); }
  @m.action set3(arg: boolean) { this.setX(3, arg); }
  @m.action set4(arg: boolean) { this.setX(4, arg); }
  @m.action set5(arg: boolean) { this.setX(5, arg); }
  @m.action set6(arg: boolean) { this.setX(6, arg); }
  @m.action set7(arg: boolean) { this.setX(7, arg); }
  @m.action set8(arg: boolean) { this.setX(8, arg); }
  @m.action set9(arg: boolean) { this.setX(9, arg); }

  private changeValue(value: number) {
    this.value = value;
    this.value = -1;
  }

  private setX(x: number, arg: boolean) {
    if (arg) {
      this.changeValue(this.values[x]);
    }
  }
};

function configInt(value: number, min: number, max: number, defaultValue: number) {
  if (!isNaN(value) && value >= min && value <= max) {
    return value;
  }

  return defaultValue;
}