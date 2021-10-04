import { components } from 'mylife-home-core';
import { logger, tools } from 'mylife-home-common';
import * as devices from './engine/devices';

const log = logger.createLogger('mylife:home:core:plugins:driver-broadlink:mp1');

import m = components.metadata;

interface Configuration {
  readonly host: string;
}

type OutputType = 'output1' | 'output2' | 'output3' | 'output4';

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'host', type: m.ConfigType.STRING })
export class MP1 {
  private readonly device: devices.MP1;
  private readonly enforcer: NodeJS.Timeout;
  private busy = false;

  constructor(config: Configuration) {
    this.device = new devices.MP1(config.host);
    this.device.on('onlineChanged', this.onOnline);
    tools.fireAsync(() => this.device.connect());

    this.enforcer = setInterval(this.enforceState, 10000);
  }

  destroy() {
    this.device.off('onlineChanged', this.onOnline);
    this.device.close();

    clearInterval(this.enforcer);
  }

  @m.state
  online: boolean = false;

  @m.state
  output1: boolean = false;

  @m.state
  output2: boolean = false;

  @m.state
  output3: boolean = false;

  @m.state
  output4: boolean = false;

  @m.action
  setOutput1(value: boolean) {
    this.output1 = value;
    this.enforceState();
  }

  @m.action
  setOutput2(value: boolean) {
    this.output2 = value;
    this.enforceState();
  }

  @m.action
  setOutput3(value: boolean) {
    this.output3 = value;
    this.enforceState();
  }

  @m.action
  setOutput4(value: boolean) {
    this.output4 = value;
    this.enforceState();
  }

  private readonly onOnline = (online: boolean) => {
    this.online = online;
    this.enforceState();
  };

  private readonly enforceState = () => {
    tools.fireAsync(() => this.doEnforceState());
  };

  private async doEnforceState() {
    if (!this.device.online || this.busy) {
      return;
    }

    this.busy = true;
    try {

      const state = await this.device.checkState();

      for (let i = 0; i < 4; ++i) {
        const propState = this[`output${i + 1}` as OutputType];

        if (state[i] !== propState) {
          log.debug(`Updating state for output ${i} to ${propState}`);
          await this.device.setState(i + 1, propState);
        }
      }

    } catch (err) {
      log.error(err, 'Error while enforcing state');
    }
    finally {
      this.busy = false;
    }
  }
}
