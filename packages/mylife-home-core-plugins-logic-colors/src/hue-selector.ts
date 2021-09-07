import { components } from 'mylife-home-core';
import { HUE } from './constants';

import m = components.metadata;

interface Config {
  hue0: number;
  hue1: number;
  hue2: number;
  hue3: number;
  hue4: number;
  hue5: number;
  hue6: number;
  hue7: number;
  hue8: number;
  hue9: number;
}

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'hue0', type: m.ConfigType.INTEGER })
@m.config({ name: 'hue1', type: m.ConfigType.INTEGER })
@m.config({ name: 'hue2', type: m.ConfigType.INTEGER })
@m.config({ name: 'hue3', type: m.ConfigType.INTEGER })
@m.config({ name: 'hue4', type: m.ConfigType.INTEGER })
@m.config({ name: 'hue5', type: m.ConfigType.INTEGER })
@m.config({ name: 'hue6', type: m.ConfigType.INTEGER })
@m.config({ name: 'hue7', type: m.ConfigType.INTEGER })
@m.config({ name: 'hue8', type: m.ConfigType.INTEGER })
@m.config({ name: 'hue9', type: m.ConfigType.INTEGER })
export class HueSelector {
  private readonly hues: number[] = [];

  constructor(config: Config) {
    for (let index = 0; index < 10; ++index) {
      this.hues.push(config[`hue${index}` as keyof Config]);
    }

    this.hue = this.hues[0];
  }

  @m.state({ type: HUE })
  hue: number;

  @m.state
  white: boolean = false;

  @m.action
  setWhite(arg: boolean) {
    if (arg) {
      this.white = true;
    }
  }

  @m.action set0(arg: boolean) { this.setHue(0, arg); }
  @m.action set1(arg: boolean) { this.setHue(1, arg); }
  @m.action set2(arg: boolean) { this.setHue(2, arg); }
  @m.action set3(arg: boolean) { this.setHue(3, arg); }
  @m.action set4(arg: boolean) { this.setHue(4, arg); }
  @m.action set5(arg: boolean) { this.setHue(5, arg); }
  @m.action set6(arg: boolean) { this.setHue(6, arg); }
  @m.action set7(arg: boolean) { this.setHue(7, arg); }
  @m.action set8(arg: boolean) { this.setHue(8, arg); }
  @m.action set9(arg: boolean) { this.setHue(9, arg); }

  private setHue(index: number, arg: boolean) {
    if (arg) {
      this.white = false;
      this.hue = this.hues[index];
    }
  }
};
