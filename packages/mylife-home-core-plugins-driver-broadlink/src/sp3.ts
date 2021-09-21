import { components } from 'mylife-home-core';

import m = components.metadata;

interface Configuration {
  readonly host: string;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'host', type: m.ConfigType.STRING })
export class SP3 {
  constructor(config: Configuration) {
  }

  destroy() {
  }
  
  @m.state
  online: boolean = false;

  @m.state
  output: boolean = false;

  @m.action
  setOutput(value: boolean) {
    this.output = value;
  }
}
