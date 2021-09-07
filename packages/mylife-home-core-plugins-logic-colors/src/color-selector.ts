import { components } from 'mylife-home-core';
import { COLOR } from './constants';

import m = components.metadata;

interface Config {
  color0: number;
  color1: number;
  color2: number;
  color3: number;
  color4: number;
  color5: number;
  color6: number;
  color7: number;
  color8: number;
  color9: number;
}

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'color0', type: m.ConfigType.INTEGER })
@m.config({ name: 'color1', type: m.ConfigType.INTEGER })
@m.config({ name: 'color2', type: m.ConfigType.INTEGER })
@m.config({ name: 'color3', type: m.ConfigType.INTEGER })
@m.config({ name: 'color4', type: m.ConfigType.INTEGER })
@m.config({ name: 'color5', type: m.ConfigType.INTEGER })
@m.config({ name: 'color6', type: m.ConfigType.INTEGER })
@m.config({ name: 'color7', type: m.ConfigType.INTEGER })
@m.config({ name: 'color8', type: m.ConfigType.INTEGER })
@m.config({ name: 'color9', type: m.ConfigType.INTEGER })
export class ColorSelector {
  private readonly colors: number[] = [];

  constructor(config: Config) {
    for (let index = 0; index < 10; ++index) {
      this.colors.push(config[`color${index}` as keyof Config]);
    }

    this.color = this.colors[0];
  }

  @m.state({ type: COLOR })
  color: number;

  @m.action set0(arg: boolean) { this.setColor(0, arg); }
  @m.action set1(arg: boolean) { this.setColor(1, arg); }
  @m.action set2(arg: boolean) { this.setColor(2, arg); }
  @m.action set3(arg: boolean) { this.setColor(3, arg); }
  @m.action set4(arg: boolean) { this.setColor(4, arg); }
  @m.action set5(arg: boolean) { this.setColor(5, arg); }
  @m.action set6(arg: boolean) { this.setColor(6, arg); }
  @m.action set7(arg: boolean) { this.setColor(7, arg); }
  @m.action set8(arg: boolean) { this.setColor(8, arg); }
  @m.action set9(arg: boolean) { this.setColor(9, arg); }

  private setColor(index: number, arg: boolean) {
    if (arg) {
      this.color = this.colors[index];
    }
  }
};
