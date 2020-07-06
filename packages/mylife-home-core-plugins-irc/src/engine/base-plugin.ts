import { tools } from 'mylife-home-common';
import { registry, State } from './registry';

export interface PluginConfiguration {
  readonly networkKey: string;
  readonly ircComponent: string;
}

export abstract class BasePlugin {
  private readonly networkKey: string;
  private readonly componentId: string;
  private state: State = {};

  constructor(config: PluginConfiguration) {
    this.networkKey = config.networkKey;
    this.componentId = config.ircComponent;

    registry.on('change', this.onChange);

    tools.fireAsync(async () => this.onChange());
  }

  destroy() {
    registry.off('change', this.onChange);
  }

  private readonly onChange = () => {
    const oldState = this.state;
    const newState = registry.findState(this.networkKey, this.componentId) || {};
    this.state = newState;

    const keys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);
    for (const key of keys) {
      const oldValue = undefinedToNull(oldState[key]);
      const newValue = undefinedToNull(newState[key]);

      if (!Object.is(oldValue, newValue)) {
        this.onStateChanged(key, newValue);
      }
    }
  };

  protected abstract onStateChanged(name: string, value: string): void;

  protected executeAction(actionName: string, ...args: string[]) {
    registry.executeAction(this.networkKey, this.componentId, actionName, args);
  }
}

function undefinedToNull(value: string) {
  return value === undefined ? null : value;
}