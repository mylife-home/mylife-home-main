import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'min', type: m.ConfigType.FLOAT, description: 'Valeur d\'entrée pour laquelle la sortie sera à 0%' })
@m.config({ name: 'max', type: m.ConfigType.FLOAT, description: 'Valeur d\'entrée pour laquelle la sortie sera à 100%. Note: si min > max, alors la conversion est dégressive.\nPar exemple si min = 10 et max = 0, alors 10 => 0%, 7.5 => 25%, 5 => 50%, 2.5 => 75%, 0 => 100%.' })
export class FloatToNullablePercent {
  private readonly min: number;
  private readonly max: number;

  constructor({ min, max }: { min: number; max: number; }) {
    this.min = min;
    this.max = max;
  }

  @m.state({ type: new m.Range(-1, 100) })
  value: number = -1;

  @m.action
  setValue(arg: number) {
    if (arg === null || isNaN(arg)) {
      this.value = -1;
      return;
    }

    const reverse = this.min > this.max;

    if (reverse) {
      this.value = 100 - compute(this.max, this.min, arg);
    } else {
      this.value = compute(this.min, this.max, arg);
    }
  }
};

function compute(min: number, max: number, arg: number) {
  if (arg < min) {
    arg = min;
  }

  if (arg > max) {
    arg = max;
  }

  const delta = max - min;
  return Math.round((arg - min) * 100 / delta);
}
