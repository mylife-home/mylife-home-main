import { components } from 'mylife-home-core';
import { Driver } from './engine/driver';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-arduino-irc:rgb');

import m = components.metadata;

interface Configuration {
  agentKey: string;
  nick: string;
  service: string;
}

interface Message {
  state: boolean;
  r: number;
  g: number;
  b: number;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'agentKey', type: m.ConfigType.STRING })
@m.config({ name: 'nick', type: m.ConfigType.STRING })
@m.config({ name: 'service', type: m.ConfigType.STRING })
export class Rgb {
  private readonly driver: Driver;

  constructor({ agentKey, nick, service }: Configuration) {
    this.driver = new Driver(agentKey, nick, service);
    this.driver.on('online', this.onOnline);
  }

  destroy() {
    this.driver.off('online', this.onOnline);
    this.driver.destroy();
  }

  @m.state
  online: boolean = false;

  @m.state
  active: boolean = false;

  @m.state({ type: new m.Range(0, 16777215) })
  color: number = 0;

  @m.action
  setActive(value: boolean) {
    this.active = value;
    this.refresh();
  }

  @m.action({ type: new m.Range(0, 16777215) })
  setColor(value: number) {
    this.color = value;
    this.refresh();
  }

  private readonly onOnline = (value: boolean) => {
    this.online = value;

    if (value) {
      this.refresh();
    }
  };

  private refresh() {
    if (!this.online) {
      return;
    }

    const msg: Message = { state: true, r: 0, g: 0, b: 0 };
    if (this.active) {
      // https://www.andrewzammit.com/blog/explode-rgb-unsigned-integer-into-individual-r-g-and-b-values/
      msg.r = ((this.color >> 16) & 255) << 2;
      msg.g = ((this.color >> 8) & 255) << 2;
      msg.b = (this.color & 255) << 2;
    }

    log.info(`rgb: ${JSON.stringify(msg)}`);
    this.driver.write(msg);
  }
}
