import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';
import { Store, getStore, releaseStore, DeviceState } from './engine/repository';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:roller-shutter');

import m = components.metadata;

interface Configuration {
  readonly boxKey: string;
  readonly deviceURL: string;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR, description: 'Volet roulant Somfy' })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING, description: 'Identifiant de la box Somfy à partir de laquelle se connecter' })
@m.config({ name: 'deviceURL', type: m.ConfigType.STRING, description: 'URL du périphérique Somfy' })
export class RollerShutter {
  private readonly store: Store;
  private readonly deviceURL: string;

  constructor(config: Configuration) {
    this.store = getStore(config.boxKey);

    this.deviceURL = config.deviceURL;

    this.store.on('onlineChanged', this.refreshOnline);
    this.store.on('deviceAdded', this.refreshOnline);
    this.store.on('deviceRemoved', this.refreshOnline);
    this.store.on('stateChanged', this.refreshState);

    this.refreshOnline();
  }

  destroy() {
    this.store.off('onlineChanged', this.refreshOnline);
    this.store.off('deviceAdded', this.refreshOnline);
    this.store.off('deviceRemoved', this.refreshOnline);
    this.store.off('stateChanged', this.refreshState);

    releaseStore(this.store.boxKey);
  }

  @m.state
  online: boolean = false;

  @m.state
  exec: boolean = false;

  @m.state({ type: new m.Range(0, 100) })
  value: number = 0;

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

  @m.action
  toggle(arg: boolean) {
    if (this.online && arg) {
      const cmd = this.value < 50 ? 'open' : 'close';
      this.store.execute(this.deviceURL, cmd);
    }
  }

  @m.action({ type: new m.Range(-1, 100) })
  setValue(arg: number) {
    if (this.online && arg !== -1) {
      this.store.execute(this.deviceURL, 'setClosure', 100 - arg);
    }
  }

  private readonly refreshOnline = () => {
    const online = this.store.online && !!this.store.getDevice(this.deviceURL);
    if (this.online === online) {
      return;
    }

    this.online = online;

    if (!online) {
      this.value = 0;
    }
  };

  private readonly refreshState = (state: DeviceState) => {
    if (state.deviceURL !== this.deviceURL) {
      return;
    }

    const value = isNaN(state.value) ? 0 : (100 - state.value);
    if (value !== this.value) {
      this.value = value;
    }
  };
}
