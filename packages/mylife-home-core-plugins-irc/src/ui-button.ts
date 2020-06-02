import { components } from 'mylife-home-core';
import { BasePlugin, PluginConfiguration } from './engine/base-plugin';
import * as encoding from './engine/encoding';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.UI })
@m.config({ name: 'configKey', type: m.ConfigType.STRING })
@m.config({ name: 'ircComponent', type: m.ConfigType.STRING })
export class UiButton extends BasePlugin {
  constructor(config: PluginConfiguration) {
    super(config);
  }

  @m.state
  value: boolean = false;

  @m.action
  action(value: boolean) {
    this.executeAction(encoding.writeBool(value));
  }

  protected onStateChanged(name: string, value: string) {
    switch (name) {
      case 'value':
        this.value = encoding.readBool(value);
        break;
    }
  }
}

