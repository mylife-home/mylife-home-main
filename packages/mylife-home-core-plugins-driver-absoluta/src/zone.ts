import { components } from 'mylife-home-core';
import { getStore, releaseStore, Store } from './engine/store';

import m = components.metadata;

interface Configuration {
  readonly boxKey: string;
  readonly label: string;
}

@m.plugin({ usage: m.PluginUsage.SENSOR, description: 'Représentation d\'une zone Absoluta' })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING, description: 'Identifiant de l\'imap-box à partir de laquelle se mettre à jour' })
@m.config({ name: 'label', type: m.ConfigType.STRING })
export class Zone {
  private readonly boxKey: string;
  private readonly label: string;
  private store: Store;

  constructor(config: Configuration) {
    this.boxKey = config.boxKey;
    this.label = config.label;

    this.store = getStore(this.boxKey);
    this.store.on('changed', this.onChanged);
    this.store.on('onlineChanged', this.onOnlineChanged);

    this.online = this.store.online;
    this.active = this.store.isActive(this.label);
  }

  destroy() {
    this.store.off('changed', this.onChanged);
    this.store.off('onlineChanged', this.onOnlineChanged);
    releaseStore(this.boxKey);
  }

  private readonly onOnlineChanged = (online: boolean) => {
    this.online = online;
  };

  private readonly onChanged = (label: string, active: boolean) => {
    if (this.label === label) {
      this.active = active;
    }
  };

  @m.state
  online: boolean = false;

  @m.state
  active: boolean = false;
}
