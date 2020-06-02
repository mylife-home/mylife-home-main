export interface PluginConfiguration {
  readonly configKey: string;
  readonly ircComponent: string;
}

export abstract class BasePlugin {
  constructor(config: PluginConfiguration) {

  }

  destroy() {

  }

  protected abstract onStateChanged(name: string, value: string): void;

  protected executeAction(arg: string) {

  }
}