import { components } from 'mylife-home-core';
import { Client } from './engine/client';
import { Store, getStore, releaseStore } from './engine/repository';

import m = components.metadata;

interface Configuration {
  readonly boxKey: string;
  readonly user: string;
  readonly password: string;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING, description: 'Identifiant pour que les composants soient mises à jour à partir de cette box Somfy' })
@m.config({ name: 'user', type: m.ConfigType.STRING })
@m.config({ name: 'password', type: m.ConfigType.STRING })
@m.config({ name: 'eventPeriod', type: m.ConfigType.INTEGER })
@m.config({ name: 'refreshPeriod', type: m.ConfigType.INTEGER })
export class Box {
  private readonly store: Store;
  private readonly client: Client;

  constructor(config: Configuration) {
    this.store = getStore(config.boxKey);

    this.client = new Client(config);
    this.store.setClient(new Client(config));
    this.client.on('onlineChanged', this.onOnlineChanged);
  }

  destroy() {
    this.store.unsetClient();
    this.client.off('onlineChanged', this.onOnlineChanged);
    this.client.destroy();

    releaseStore(this.store.boxKey);
  }

  @m.state
  online: boolean = false;

  private readonly onOnlineChanged = (value: boolean) => {
    this.online = value;
  };
};