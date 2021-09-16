import { components } from 'mylife-home-core';

import m = components.metadata;

interface Configuration {
  readonly boxKey: string;
  readonly label: string;
}

@m.plugin({ usage: m.PluginUsage.SENSOR })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING })
@m.config({ name: 'label', type: m.ConfigType.STRING })
export class Zone {
  constructor(config: Configuration) {

  }

  @m.state
  online: boolean = false;

  @m.state
  active: boolean = false;
}
