import { components } from 'mylife-home-core';
import { logger, tools } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-mpd:mpd');

import m = components.metadata;

interface Configuration {
  readonly host: string;
  readonly port: number;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'host', type: m.ConfigType.STRING })
@m.config({ name: 'port', type: m.ConfigType.INTEGER })
export class MPD {

  constructor(config: Configuration) {
  }

  destroy() {
  }

  @m.state
  online: boolean = false;

  @m.state
  playing: boolean = false;

  @m.state({ type: new m.Range(0, 100)})
  volume: number = 0;

  @m.action
  toggle(value: boolean) {
  }

  @m.action
  play(value: boolean) {
  }

  @m.action
  pause(value: boolean) {
  }

  @m.action
  next(value: boolean) {
  }

  @m.action
  prev(value: boolean) {
  }

  @m.action({ type: new m.Range(-1, 100)})
  setVolume(value: number) {
  }
}



/*
'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('core-plugins-hw-mpd.Mpd');
const mpd    = require('mpd');

module.exports = class Mpd {
  constructor(config) {

    this._host = config.host;
    this._port = parseInt(config.port);

    this._setup();
  }

  _setup() {
    this.online  = 'off';
    this.playing = 'off';
    this.volume  = 0;

    this._client = mpd.connect({
      host: this._host,
      port: this._port
    });

    this._client.on('connect', (   ) => { logger.info('MPD (%s:%s) connect', this._host, this._port); });
    this._client.on('ready',   (   ) => { logger.info('MPD (%s:%s) ready', this._host, this._port); this._refresh(); });
    this._client.on('close',   (   ) => { logger.info('MPD (%s:%s) disconnected', this._host, this._port); });
    this._client.on('error',   (err) => { logger.error('MPD (%s:%s) error :', this._host, this._port, err); this._delayedSetup(); });

    const boundRefresh = this._refresh.bind(this);
    this._client.on('system-player', boundRefresh);
    this._client.on('system-mixer', boundRefresh);
  }

  _delayedSetup() {
    if(this._setupTimer) {
      clearTimeout(this._setupTimer);
      this._setupTimer = null;
    }
    this._setupTimer = setTimeout(() => this._setup(), 5000);
  }

  _refresh() {
    this._client.sendCommand(mpd.cmd('status', []), (err, msg) => {
      if(err) {
        logger.error('MPD (%s:%s) error : %s', this._host, this._port, err);
        this._client.socket.destroy();
        this._setup();
        return;
      }
      const data = mpd.parseKeyValueMessage(msg);

      this.online  = 'on';
      this.playing = (data.state === 'play') ? 'on' : 'off';
      this.volume  = parseInt(data.volume);
    });
  }

  _sendAndRefresh(cmd, args) {
    logger.info('MPD (%s:%s) send command: %s(%j)', this._host, this._port, cmd, args);
    this._client.sendCommand(mpd.cmd(cmd, args), () => {
      this._refresh();
    });
  }

  toggle(arg) {
    if(this.online === 'off') { return; }
    if(arg === 'off') { return; }
    if(this.playing === 'on') {
      this.pause(arg);
    } else {
      this.play(arg);
    }
  }

  play(arg) {
    if(this.online === 'off') { return; }
    if(arg === 'off') { return; }
    this._sendAndRefresh('play', []);
  }

  pause(arg) {
    if(this.online === 'off') { return; }
    if(arg === 'off') { return; }
    this._sendAndRefresh('pause', [1]);
  }

  next(arg) {
    if(this.online === 'off') { return; }
    if(arg === 'off') { return; }
    this._sendAndRefresh('next', []);
  }

  prev(arg) {
    if(this.online === 'off') { return; }
    if(arg === 'off') { return; }
    this._sendAndRefresh('previous', []);
  }

  setVolume(arg) {
    if(arg === -1) { return; }
    if(this.online === 'off') { return; }
    this._sendAndRefresh('setvol', [arg]);
  }

  close(done) {
    this._client.socket.destroy();
    this._setupTimer && clearTimeout(this._setupTimer);
    setImmediate(done);
  }

  static metadata(builder) {
    const binary          = builder.enum('off', 'on');
    const percent         = builder.range(0, 100);
    const nullablePercent = builder.range(-1, 100);

    builder.usage.driver();

    builder.attribute('online', binary);
    builder.attribute('playing', binary);
    builder.attribute('volume', percent);

    builder.action('toggle', binary);
    builder.action('play', binary);
    builder.action('pause', binary);
    builder.action('next', binary);
    builder.action('prev', binary);
    builder.action('setVolume', nullablePercent);

    builder.config('host', 'string');
    builder.config('port', 'integer');
  }
};
*/