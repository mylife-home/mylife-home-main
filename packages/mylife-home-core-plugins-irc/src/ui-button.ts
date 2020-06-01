import { components } from 'mylife-home-core';

import plugin = components.metadata.plugin;
import config = components.metadata.config;
import state = components.metadata.state;
import action = components.metadata.action;
import ConfigType = components.metadata.ConfigType;
import PluginUsage = components.metadata.PluginUsage;

@plugin({ usage: PluginUsage.UI })
@config({ name: 'ircConfigKey', type: ConfigType.STRING })
@config({ name: 'ircComponent', type: ConfigType.STRING })
export class UiButton {

  @state
  value: boolean;

  @action
  action(value: boolean) {

  }
}
