import { components } from 'mylife-home-core';

import m = components.metadata;

interface Configuration {
  agentKey: string;
  nick: string;
  service: string;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'agentKey', type: m.ConfigType.STRING })
@m.config({ name: 'nick', type: m.ConfigType.STRING })
@m.config({ name: 'service', type: m.ConfigType.STRING })
export class Rgb {
  constructor(config: Configuration) {
  }

  @m.state
  online: boolean = false;

  @m.state
  active: boolean = false;

  @m.state({ type: new m.Range(0, 16777215)})
  color: number = 0;

  @m.action
  setActive(value: boolean) {
  }

  @m.action({ type: new m.Range(0, 16777215)})
  setColor(value: number) {
  }
}
