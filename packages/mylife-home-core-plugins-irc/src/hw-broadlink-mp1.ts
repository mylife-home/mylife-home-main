import { components } from 'mylife-home-core';
import { BasePlugin, PluginConfiguration } from './engine/base-plugin';
import * as encoding from './engine/encoding';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'networkKey', type: m.ConfigType.STRING })
@m.config({ name: 'ircComponent', type: m.ConfigType.STRING })
export class HwBroadlinkMp1 extends BasePlugin {
  constructor(config: PluginConfiguration) {
    super(config);
  }

  @m.state
  online: boolean = false;

  @m.state
  output1: boolean = false;

  @m.state
  output2: boolean = false;

  @m.state
  output3: boolean = false;

  @m.state
  output4: boolean = false;

  @m.action
  set1(value: boolean) {
    this.executeAction('set1', encoding.writeBool(value));
  }

  @m.action
  set2(value: boolean) {
    this.executeAction('set2', encoding.writeBool(value));
  }

  @m.action
  set3(value: boolean) {
    this.executeAction('set3', encoding.writeBool(value));
  }

  @m.action
  set4(value: boolean) {
    this.executeAction('set4', encoding.writeBool(value));
  }

  protected onStateChanged(name: string, value: string) {
    switch (name) {
      case 'online':
        this.online = value === null ? false : encoding.readBool(value);
        break;
      case 'output1':
        this.output1 = value === null ? false : encoding.readBool(value);
        break;
      case 'output2':
        this.output2 = value === null ? false : encoding.readBool(value);
        break;
      case 'output3':
        this.output3 = value === null ? false : encoding.readBool(value);
        break;
      case 'output4':
        this.output4 = value === null ? false : encoding.readBool(value);
        break;
    }
  }
}