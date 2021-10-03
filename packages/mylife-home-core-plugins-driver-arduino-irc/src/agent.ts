import { components } from 'mylife-home-core';
import { IrcClient } from './engine/irc-client';

// https://github.com/mylife-home/mylife-home-common/blob/master/lib/net

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'agentKey', type: m.ConfigType.STRING })
@m.config({ name: 'host', type: m.ConfigType.STRING })
@m.config({ name: 'channel', type: m.ConfigType.STRING })
export class Agent {
  private readonly client: IrcClient;

  constructor({ networkKey, server, channel }: { networkKey: string; server: string; channel: string; }) {
    this.client = new IrcClient(networkKey, server, channel);
  }

  destroy() {
    this.client.close();
  }

  @m.state
  online: boolean = false;
}
