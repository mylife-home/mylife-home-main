import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'value', type: m.ConfigType.BOOL })
export class ConstantBool {
  constructor({ value }: { value: boolean; }) {
    this.value = value;
  }

  @m.state
  value: boolean;
};
