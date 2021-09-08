import { components } from 'mylife-home-core';
import { BasePlugin, PluginConfiguration } from './engine/base-plugin';
import * as encoding from './engine/encoding';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'networkKey', type: m.ConfigType.STRING })
@m.config({ name: 'ircComponent', type: m.ConfigType.STRING })
export class HwSysfsAcDimmer extends BasePlugin {
  constructor(config: PluginConfiguration) {
    super(config);
  }

  @m.state
  online: boolean = false;

  @m.state({ type: new m.Range(0, 100)})
  value: number = 0;

  @m.action({ type: new m.Range(0, 100)})
  setValue(value: number) {
    this.executeAction('setValue', encoding.writeRange(value));
  }

  protected onStateChanged(name: string, value: string) {
    switch (name) {
      case 'online':
        this.online = value === null ? false : encoding.readBool(value);
        break;
      case 'value':
        this.value = value === null ? 0 : encoding.readRange(value);
        break;
    }
  }
}