import { components } from 'mylife-home-core';
import { Controller, open, close } from './engine/controller';

import m = components.metadata;

interface Configuration {
  readonly remote: string;
  readonly button: string;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'remote', type: m.ConfigType.STRING })
@m.config({ name: 'button', type: m.ConfigType.STRING })
export class Send {
  private readonly remote: string;
  private readonly button: string;
  private closing = false;
  private controller: Controller;

  constructor(config: Configuration) {
    this.remote = config.remote;
    this.button = config.button;

    this.controller = open();
    this.controller.on('online', this.onOnlineChanged);
  }

  destroy() {
    this.closing = true;

    this.controller.off('online', this.onOnlineChanged);
    close(this.controller);
  }

  @m.state
  online: boolean = false;

  @m.action
  action(arg: boolean) {
    if(this.closing || !arg) {
      return;
    }

    this.controller.send(this.remote, this.button);
  }

  private readonly onOnlineChanged = (value: boolean) => {
    this.online = value;
  };
}
