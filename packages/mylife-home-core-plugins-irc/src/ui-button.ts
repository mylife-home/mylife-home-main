import { components } from 'mylife-home-core';

@components.metadata.plugin({ usage: components.metadata.PluginUsage.UI })
export class UiButton {

  @components.metadata.state
  value: boolean;

  @components.metadata.action
  action(value: boolean) {

  }
}
