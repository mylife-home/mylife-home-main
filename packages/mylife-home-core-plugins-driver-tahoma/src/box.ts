import { components } from 'mylife-home-core';
import { Connection, repository } from './engine';

import m = components.metadata;

interface Configuration {
  readonly boxKey: string;
  readonly user: string;
  readonly password: string;
  readonly eventPeriod: number;
  readonly refreshPeriod: number;
}

@m.plugin({ usage: m.PluginUsage.ACTUATOR })
@m.config({ name: 'boxKey', type: m.ConfigType.STRING, description: 'Identifiant pour que les composants soient mises à jour à partir de cette box Somfy' })
@m.config({ name: 'user', type: m.ConfigType.STRING })
@m.config({ name: 'password', type: m.ConfigType.STRING })
@m.config({ name: 'eventPeriod', type: m.ConfigType.INTEGER })
@m.config({ name: 'refreshPeriod', type: m.ConfigType.INTEGER })
export class Box {
  private readonly key: string;
  private readonly connection: Connection;
  constructor(config: Configuration) {

    this.key = config.boxKey;
    this.connection = new Connection(config);
    this.connection.on('loggedChanged', (value: boolean) => { this.online = value; });

    repository.add(this.key, this.connection);
  }

  destroy() {
    repository.remove(this.key);
    this.connection.close();
  }

  @m.state
  online: boolean = false;
};