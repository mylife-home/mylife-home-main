import { components } from 'mylife-home-core';
import { BasePlugin, PluginConfiguration } from './engine/base-plugin';
import * as encoding from './engine/encoding';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'networkKey', type: m.ConfigType.STRING })
@m.config({ name: 'ircComponent', type: m.ConfigType.STRING })
export class HwLircSend extends BasePlugin {
  constructor(config: PluginConfiguration) {
    super(config);
  }

  @m.state
  online: boolean = false;

  @m.action
  action(value: boolean) {
    this.executeAction('action', encoding.writeBool(value));
  }

  protected onStateChanged(name: string, value: string) {
    switch (name) {
      case 'online':
        this.online = value === null ? false : encoding.readBool(value);
        break;
    }
  }
}