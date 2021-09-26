import { components } from 'mylife-home-core';
import { logger, tools } from 'mylife-home-common';
import  { Device, States, repository } from './engine';

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
  constructor(config: Configuration) {
    this._config = { url: config.url, label: config.label };
    this._key    = config.boxKey;
    this._device = null;
    this.online  = 'off';
    this.exec    = 'off';
    this.value   = 0;

    this._deviceOnlineCallback      = (value) => (this.online = value ? 'on' : 'off');
    this._deviceExecutingCallback   = (value) => (this.exec = value ? 'on' : 'off');
    this._deviceStateCallback       = () => this._stateChanged();
    this._repositoryChangedCallback = (evt) => {
      if(evt.key !== this._key) { return; }
      this._refreshDevice();
    }

    repository.on('changed', this._repositoryChangedCallback);

    this._refreshDevice();
  }

  close(done) {
    this._deleteDevice(true);
    repository.removeListener('changed', this._repositoryChangedCallback);
    setImmediate(done);
  }

  @m.state
  online: boolean = false;

  @m.state
  exec: boolean = false;

  @m.state({ type: new m.Range(0, 100) })
  value: number = 0;

  doOpen(arg) {
    if(this.online === 'off') { return; }
    if(arg === 'off') { return; }

    this._device.execute('open', [], (err) => err && log.error(err));
  }

  doClose(arg) {
    if(this.online === 'off') { return; }
    if(arg === 'off') { return; }

    this._device.execute('close', [], (err) => err && log.error(err));
  }

  toggle(arg) {
    if(this.online === 'off') { return; }
    if(arg === 'off') { return; }

    const cmd = this.value < 50 ? 'open' : 'close';
    this._device.execute(cmd, [], (err) => err && log.error(err));
  }

  setValue(arg) {
    if(arg === -1) { return; }
    if(this.online === 'off') { return; }

    this._device.execute('setClosure', [100 - arg], (err) => err && log.error(err));
  }
  
  _deleteDevice(closing = false) {

    if(!closing) {
      this.online  = 'off';
      this.open    = 'on';
      this.closure = 0;
    }

    if(!this._device) { return; }

    this._device.removeListener('onlineChanged', this._deviceOnlineCallback);
    this._device.removeListener('executingChanged', this._deviceExecutingCallback);
    this._device.removeListener('stateChanged', this._deviceStateCallback);
    this._device = null;
  }

  _refreshDevice() {
    const connection = repository.get(this._key);
    if(!connection) {
      this._deleteDevice();
      return;
    }

    if(this._device) { return; }

    this._device = new Device(this._config, connection);
    this._device.on('onlineChanged', this._deviceOnlineCallback);
    this._device.on('executingChanged', this._deviceExecutingCallback);
    this._device.on('stateChanged', this._deviceStateCallback);

    this._deviceOnlineCallback(this._device.online);
    this._deviceExecutingCallback(this._device.executing);
    this._stateChanged();
  }

  _stateChanged() {
    const state = parseInt(this._device.getState(States.STATE_CLOSURE));
    const value = isNaN(state) ? 0 : (100 - state);
    if(value !== this.value) {
      this.value = value;
    }
  }

  
  static metadata(builder) {
    const binary          = builder.enum('off', 'on');
    const percent         = builder.range(0, 100);
    const nullablePercent = builder.range(-1, 100);

    builder.usage.driver();

    builder.attribute('online', binary);
    builder.attribute('exec', binary);
    builder.attribute('value', percent);

    builder.action('doOpen', binary);
    builder.action('doClose', binary);
    builder.action('toggle', binary);
    builder.action('setValue', nullablePercent);

    builder.config('boxKey', 'string');
    builder.config('label', 'string');
    builder.config('url', 'string');
  }
}
