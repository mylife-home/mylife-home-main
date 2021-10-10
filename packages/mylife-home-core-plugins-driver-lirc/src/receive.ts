import { components } from 'mylife-home-core';
import { Controller, open, close } from './engine/controller';

import m = components.metadata;

interface Configuration {
  readonly remote: string;
  readonly button: string;
  readonly repeats: boolean;
}

@m.plugin({ usage: m.PluginUsage.SENSOR })
@m.config({ name: 'remote', type: m.ConfigType.STRING })
@m.config({ name: 'button', type: m.ConfigType.STRING })
@m.config({ name: 'repeats', type: m.ConfigType.BOOL, description: 'VRAI=tous les messages comptent, FALSE=seulement le premier message déclenche la sortie, les suivants sont ignorés' })
export class Receive {
  private readonly remote: string;
  private readonly button: string;
  private readonly repeats: boolean;
  private closing = false;
  private controller: Controller;

  constructor(config: Configuration) {
    this.remote = config.remote;
    this.button = config.button;
    this.repeats = config.repeats;

    this.controller = open();
    this.controller.on('online', this.onOnline);
    this.controller.on('receive', this.onReceive);
  }

  destroy() {
    this.closing = true;

    this.controller.off('online', this.onOnline);
    this.controller.on('receive', this.onReceive);
    close(this.controller);
  }

  @m.state
  online: boolean = false;

  @m.state
  value: boolean = false;

  private readonly onOnline = (value: boolean) => {
    this.online = value;
  };

  private readonly onReceive = (remote: string, button: string, repeat: number) => {
    if (!this.closing && remote === this.remote && button === this.button && (repeat === 0 || this.repeats)) {
      this.value = true;
      this.value = false;
    }
  };
}
