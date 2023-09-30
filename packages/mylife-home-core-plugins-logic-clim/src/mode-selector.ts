import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'temperatureThreshold', type: m.ConfigType.INTEGER })
export class ModeSelector {
  private readonly temperatureThreshold: number;

  constructor({ temperatureThreshold }: { temperatureThreshold: number; }) {
    this.temperatureThreshold = temperatureThreshold;
    this.computeMode();
  }

  @m.state({ type: new m.Enum('cool', 'dry', 'fan-only', 'heat', 'heat-cool', 'off') })
  mode: string;

  @m.state
  active: boolean = false;

  @m.state({ type: new m.Range(17, 30) })
  temperature: number = 17;

  @m.action({ type: new m.Range(17, 30) })
  setTemperature(value: number) {
    this.temperature = value;
    this.computeMode();
  }

  @m.action
  setActive(value: boolean) {
    this.active = value;
    this.computeMode();
  }

  private computeMode() {
    if (!this.active) {
      this.mode = 'off';
      return;
    }

    if (this.temperature > this.temperatureThreshold) {
      this.mode = 'cool';
    } else {
      this.mode = 'heat';
    }
  }
};
