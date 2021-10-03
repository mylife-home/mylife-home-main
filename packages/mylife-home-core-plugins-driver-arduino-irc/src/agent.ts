import { components } from 'mylife-home-core';
import { Client } from './engine/client';
import { repository } from './engine/repository';

// https://github.com/mylife-home/mylife-home-common/blob/master/lib/net

import m = components.metadata;

interface Configuration {
  agentKey: string;
  host: string;
  channel: string;
}

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'agentKey', type: m.ConfigType.STRING })
@m.config({ name: 'host', type: m.ConfigType.STRING })
@m.config({ name: 'channel', type: m.ConfigType.STRING })
export class Agent {
  private readonly key: string;
  private readonly client: Client;

  constructor({ agentKey, host, channel }: Configuration) {
    this.key = agentKey;

    this.client = new Client(host, channel);
    repository.add(this.key, this.client);
    this.client.on('online', this.onOnline);
  }

  destroy() {
    this.client.off('online', this.onOnline);
    Repository.remove(this.key);
    this.client.destroy();
  }

  @m.state
  online: boolean = false;

  private readonly onOnline = (value: boolean) => {
    this.online = value;
  };
}
