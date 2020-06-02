import { components } from 'mylife-home-core';
import { Client } from 'irc';

// https://github.com/mylife-home/mylife-home-common/blob/master/lib/net/client.js

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'configKey', type: m.ConfigType.STRING })
@m.config({ name: 'server', type: m.ConfigType.STRING })
@m.config({ name: 'channel', type: m.ConfigType.STRING })
export class Config {
  constructor({ configKey, server, channel }: { ircComponent: string; }) {
  }

  destroy() {
  }
}
