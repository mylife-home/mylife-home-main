import { components } from 'mylife-home-core';
import { BasePlugin, PluginConfiguration } from './engine/base-plugin';
import * as encoding from './engine/encoding';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'networkKey', type: m.ConfigType.STRING })
@m.config({ name: 'ircComponent', type: m.ConfigType.STRING })
export class HwTahomaSlidingGate extends BasePlugin {
  constructor(config: PluginConfiguration) {
    super(config);
  }

  @m.state
  online: boolean = false;

  @m.state
  exec: boolean = false;

  @m.action
  doOpen(value: boolean) {
    this.executeAction('doOpen', encoding.writeBool(value));
  }

  @m.action
  doClose(value: boolean) {
    this.executeAction('doClose', encoding.writeBool(value));
  }

  protected onStateChanged(name: string, value: string) {
    switch (name) {
      case 'online':
        this.online = value === null ? false : encoding.readBool(value);
        break;
      case 'exec':
        this.exec = value === null ? false : encoding.readBool(value);
        break;
    }
  }
}