import { components } from 'mylife-home-core';

import m = components.metadata;

interface Configuration {
  readonly host: string;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'host', type: m.ConfigType.STRING })
export class MP1 {
  constructor(config: Configuration) {
  }

  destroy() {
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
  setOutput1(value: boolean) {
    this.output1 = value;
  }

  @m.action
  setOutput2(value: boolean) {
    this.output2 = value;
  }

  @m.action
  setOutput3(value: boolean) {
    this.output3 = value;
  }

  @m.action
  setOutput4(value: boolean) {
    this.output4 = value;
  }
}
