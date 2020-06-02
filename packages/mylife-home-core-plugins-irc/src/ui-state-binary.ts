import { components } from 'mylife-home-core';
import { BasePlugin, PluginConfiguration } from './engine/base-plugin';
import * as encoding from './engine/encoding';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.UI })
@m.config({ name: 'networkKey', type: m.ConfigType.STRING })
@m.config({ name: 'ircComponent', type: m.ConfigType.STRING })
export class UiStateBinary extends BasePlugin {
  constructor(config: PluginConfiguration) {
    super(config);
  }

  @m.state
  value: boolean = false;

  protected onStateChanged(name: string, value: string) {
    switch (name) {
      case 'value':
        this.value = value === null ? false : encoding.readBool(value);
        break;
    }
  }
}
