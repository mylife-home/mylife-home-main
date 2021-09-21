import { components } from 'mylife-home-core';
import { logger, tools } from 'mylife-home-common';
import * as devices from './engine/devices';
import m = components.metadata;

const log = logger.createLogger('mylife:home:core:plugins:driver-broadlink:sp3');

interface Configuration {
  readonly host: string;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'host', type: m.ConfigType.STRING })
export class SP3 {
  private readonly device: devices.SP3;
  private readonly enforcer: NodeJS.Timeout;
  private busy = false;

  constructor(config: Configuration) {
    this.device = new devices.SP3(config.host);
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
  output: boolean = false;

  @m.action
  setOutput(value: boolean) {
    this.output = value;
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

      const newValue = this.output;
      if (state !== newValue) {
        log.debug(`Updating state to ${newValue}`);
        await this.device.setState(newValue);
      }

    } catch (err) {
      log.error(err, 'Error while enforcing state');
    }
    finally {
      this.busy = false;
    }
  }
}
