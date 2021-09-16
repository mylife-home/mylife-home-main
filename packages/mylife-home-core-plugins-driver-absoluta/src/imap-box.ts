import { components } from 'mylife-home-core';
import { ConnectionSettings } from './engine/connection';
import { getStore, releaseStore, Store } from './engine/store';

import m = components.metadata;

export interface Configuration extends ConnectionSettings {
  readonly boxKey: string;
}

@m.plugin({ usage: m.PluginUsage.SENSOR })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING })
@m.config({ name: 'user', type: m.ConfigType.STRING })
@m.config({ name: 'password', type: m.ConfigType.STRING })
@m.config({ name: 'host', type: m.ConfigType.STRING })
@m.config({ name: 'port', type: m.ConfigType.INTEGER })
@m.config({ name: 'secure', type: m.ConfigType.BOOL })
export class ImapBox {
  private readonly boxKey: string;
  private store: Store;

  constructor(config: Configuration) {
    this.boxKey = config.boxKey;

    this.store = getStore(this.boxKey);

    // TODO: connection + update store + update online
  }

  destroy() {
    releaseStore(this.boxKey);
  }
  
  @m.state
  online: boolean = false;
}
