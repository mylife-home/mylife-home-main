import { components } from 'mylife-home-core';
import { BasePlugin, PluginConfiguration } from './engine/base-plugin';
import * as encoding from './engine/encoding';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'networkKey', type: m.ConfigType.STRING })
@m.config({ name: 'ircComponent', type: m.ConfigType.STRING })
export class HwMpdMpd extends BasePlugin {
  constructor(config: PluginConfiguration) {
    super(config);
  }

  @m.state
  online: boolean = false;

  @m.state
  playing: boolean = false;

  @m.state({ type: new m.Range(0, 100)})
  volume: number = 0;

  @m.action
  toggle(value: boolean) {
    this.executeAction('toggle', encoding.writeBool(value));
  }

  @m.action
  play(value: boolean) {
    this.executeAction('play', encoding.writeBool(value));
  }

  @m.action
  pause(value: boolean) {
    this.executeAction('pause', encoding.writeBool(value));
  }

  @m.action
  next(value: boolean) {
    this.executeAction('next', encoding.writeBool(value));
  }

  @m.action
  prev(value: boolean) {
    this.executeAction('prev', encoding.writeBool(value));
  }

  @m.action({ type: new m.Range(-1, 100)})
  setVolume(value: number) {
    this.executeAction('setVolume', encoding.writeRange(value));
  }

  protected onStateChanged(name: string, value: string) {
    switch (name) {
      case 'online':
        this.online = value === null ? false : encoding.readBool(value);
        break;
      case 'playing':
        this.playing = value === null ? false : encoding.readBool(value);
        break;
      case 'volume':
        this.volume = value === null ? 0 : encoding.readRange(value);
        break;
    }
  }
}