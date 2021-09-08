import { components } from 'mylife-home-core';
import { BasePlugin, PluginConfiguration } from './engine/base-plugin';
import * as encoding from './engine/encoding';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'networkKey', type: m.ConfigType.STRING })
@m.config({ name: 'ircComponent', type: m.ConfigType.STRING })
export class HwSensorsTemperature extends BasePlugin {
  constructor(config: PluginConfiguration) {
    super(config);
  }

  @m.state({ type: new m.Float()})
  value: number = 0;

  protected onStateChanged(name: string, value: string) {
    switch (name) {
      case 'value':
        this.value = value === null ? 0 : encoding.readTemperature(value);
        break;
    }
  }
}