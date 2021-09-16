import { components } from 'mylife-home-core';

import m = components.metadata;

interface Configuration {
  readonly boxKey: string;
  readonly user: string;
  readonly password: string;
  readonly host: string;
  readonly port: number;
  readonly tls: boolean;
}

@m.plugin({ usage: m.PluginUsage.SENSOR })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING })
@m.config({ name: 'user', type: m.ConfigType.STRING })
@m.config({ name: 'password', type: m.ConfigType.STRING })
@m.config({ name: 'host', type: m.ConfigType.STRING })
@m.config({ name: 'port', type: m.ConfigType.INTEGER })
@m.config({ name: 'tls', type: m.ConfigType.BOOL })
export class ImapBox {
  constructor(config: Configuration) {

  }

  @m.state
  online: boolean = false;
}
