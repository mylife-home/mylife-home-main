import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';
import { Store, getStore, releaseStore } from './engine/repository';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:sliding-gate');

import m = components.metadata;

interface Configuration {
  readonly boxKey: string;
  readonly deviceURL: string;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR, description: 'Portail coulissant Somfy' })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING, description: 'Identifiant de la box Somfy à partir de laquelle se connecter' })
@m.config({ name: 'deviceURL', type: m.ConfigType.STRING, description: 'URL du périphérique Somfy' })
export class SlidingGate {
  private readonly store: Store;
  private readonly deviceURL: string;

  constructor(config: Configuration) {
    this.store = getStore(config.boxKey);

    this.deviceURL = config.deviceURL;

    this.store.on('onlineChanged', this.refreshOnline);
    this.store.on('deviceAdded', this.refreshOnline);
    this.store.on('deviceRemoved', this.refreshOnline);

    this.refreshOnline();
  }

  destroy() {
    this.store.off('onlineChanged', this.refreshOnline);
    this.store.off('deviceAdded', this.refreshOnline);
    this.store.off('deviceRemoved', this.refreshOnline);

    releaseStore(this.store.boxKey);
  }

  @m.state
  online: boolean = false;

  @m.state
  exec: boolean = false;

  @m.action
  doOpen(arg: boolean) {
    if (this.online && arg) {
      this.store.execute(this.deviceURL, 'open');
    }
  }

  @m.action
  doClose(arg: boolean) {
    if (this.online && arg) {
      this.store.execute(this.deviceURL, 'close');
    }
  }

  private readonly refreshOnline = () => {
    this.online = this.store.online && !!this.store.getDevice(this.deviceURL);
  }
}
