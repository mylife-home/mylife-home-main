import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';
import { Device, States, repository } from './engine';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:roller-shutter');

import m = components.metadata;

interface Configuration {
  readonly boxKey: string;
  readonly label: string;
  readonly url: string;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR, description: 'Volet roulant Somfy' })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING, description: 'Identifiant de la box Somfy à partir de laquelle se connecter' })
@m.config({ name: 'label', type: m.ConfigType.STRING })
@m.config({ name: 'url', type: m.ConfigType.STRING })
export class RollerShutter {
  private config: { url: string; label: string; };
  private readonly key: string;
  private device: Device;

  constructor(config: Configuration) {
    this.config = { url: config.url, label: config.label };
    this.key = config.boxKey;
    this.device = null;

    repository.on('changed', this.onRepositoryChanged);

    this.refreshDevice();
  }

  destroy() {
    this.deleteDevice(true);
    repository.off('changed', this.onRepositoryChanged);
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
      this.device.execute('open', [], (err) => err && log.error(err));
    }
  }

  @m.action
  doClose(arg: boolean) {
    if (this.online && arg) {
      this.device.execute('close', [], (err) => err && log.error(err));
    }
  }

  @m.action
  toggle(arg: boolean) {
    if (this.online && arg) {
      const cmd = this.value < 50 ? 'open' : 'close';
      this.device.execute(cmd, [], (err) => err && log.error(err));
    }
  }

  @m.action({ type: new m.Range(-1, 100) })
  setValue(arg: number) {
    if (this.online && arg !== -1) {
      this.device.execute('setClosure', [100 - arg], (err) => err && log.error(err));
    }
  }

  private readonly onDeviceOnlineChanged = (value: boolean) => {
    this.online = value;
  };

  private readonly onDeviceExecutingChanged = (value: boolean) => {
    this.exec = value;
  };

  private readonly onRepositoryChanged = (evt) => {
    if (evt.key === this.key) {
      this.refreshDevice();
    }
  };

  private deleteDevice(closing = false) {
    if (!closing) {
      this.online = false;
      this.value = 0;
    }

    if (!this.device) {
      return;
    }

    this.device.removeListener('onlineChanged', this.onDeviceOnlineChanged);
    this.device.removeListener('executingChanged', this.onDeviceExecutingChanged);
    this.device.removeListener('stateChanged', this.onDeviceStateChanged);
    this.device = null;
  }

  private refreshDevice() {
    const connection = repository.get(this.key);
    if (!connection) {
      this.deleteDevice();
      return;
    }

    if (this.device) {
      return;
    }

    this.device = new Device(this.config, connection);
    this.device.on('onlineChanged', this.onDeviceOnlineChanged);
    this.device.on('executingChanged', this.onDeviceExecutingChanged);
    this.device.on('stateChanged', this.onDeviceStateChanged);

    this.onDeviceOnlineChanged(this.device.online);
    this.onDeviceExecutingChanged(this.device.executing);
    this.onDeviceStateChanged();
  }

  private readonly onDeviceStateChanged = () => {
    const state = parseInt(this.device.getState(States.STATE_CLOSURE));
    const value = isNaN(state) ? 0 : 100 - state;
    if (value !== this.value) {
      this.value = value;
    }
  }
}
