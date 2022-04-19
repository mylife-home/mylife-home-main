import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.UI })
export class UiStateText {

  @m.state
  value: string = '';

  @m.action
  setValue(value: string) {
    this.value = value;
  }
}
