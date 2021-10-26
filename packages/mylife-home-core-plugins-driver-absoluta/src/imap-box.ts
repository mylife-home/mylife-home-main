import { components } from 'mylife-home-core';
import { ConnectionSettings } from './engine/connection';
import { Engine } from './engine/engine';
import { getStore, releaseStore } from './engine/store';

import m = components.metadata;

export interface Configuration extends ConnectionSettings {
  readonly boxKey: string;
}

@m.plugin({ usage: m.PluginUsage.SENSOR, description: 'Connexion IMAP pour récupérer les évènements de zone Absoluta' })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING, description: 'Identifiant pour que les zones soient mises à jour à partir de cette imap-box' })
@m.config({ name: 'user', type: m.ConfigType.STRING })
@m.config({ name: 'password', type: m.ConfigType.STRING })
@m.config({ name: 'host', type: m.ConfigType.STRING })
@m.config({ name: 'port', type: m.ConfigType.INTEGER })
@m.config({ name: 'secure', type: m.ConfigType.BOOL })
export class ImapBox {
  private readonly boxKey: string;
  private readonly engine: Engine;

  constructor(config: Configuration) {
    this.boxKey = config.boxKey;

    const store = getStore(this.boxKey);
    this.engine = new Engine(store, config);
  }

  destroy() {
    this.engine.close();
    releaseStore(this.boxKey);
  }
  
  @m.state
  online: boolean = false;
}
