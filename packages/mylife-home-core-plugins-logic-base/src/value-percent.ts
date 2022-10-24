import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'toggleThreshold', type: m.ConfigType.INTEGER, description: 'Valeur partir de laquelle toggle passe à OFF ou ON. Typiquement 1 (Note: peut être écrasé par l\'action \'setToggleThreshold\'' })
@m.config({ name: 'onValue', type: m.ConfigType.INTEGER, description: 'Valeur définie lorsqu\'on passe à ON. Typiquement 100 (Note: peut être écrasé par l\'action \'setOnValue\'' })
@m.config({ name: 'offValue', type: m.ConfigType.INTEGER, description: 'Valeur définie lorsqu\'on passe à OFF. Typiquement 0 (Note: peut être écrasé par l\'action \'setOffValue\'' })
export class ValuePercent {
  constructor({ toggleThreshold, onValue, offValue }: { toggleThreshold: number; onValue: number; offValue: number; }) {
    this.toggleThreshold = toggleThreshold;
    this.onValue = onValue;
    this.offValue = offValue;

    this.value = offValue;
  }

  @m.state({ type: new m.Range(0, 100), description: 'Valeur partir de laquelle toggle passe à OFF ou ON. Typiquement 1' })
  toggleThreshold: number;

  @m.state({ type: new m.Range(0, 100), description: 'Valeur définie lorsqu\'on passe à ON. Typiquement 100' })
  onValue: number;

  @m.state({ type: new m.Range(0, 100), description: 'Valeur définie lorsqu\'on passe à OFF. Typiquement 0' })
  offValue: number;

  @m.state({ type: new m.Range(0, 100) })
  value: number;

  @m.action({ type: new m.Range(0, 100) })
  setValue(arg: number) {
    this.value = arg;
  }

  @m.action({ type: new m.Range(-1, 100) })
  setPulse(arg: number) {
    if (arg !== -1) {
      this.value = arg;
    }
  }

  @m.action
  on(arg: boolean) {
    if (arg) {
      this.value = this.onValue;
    }
  }

  @m.action
  off(arg: boolean) {
    if (arg) {
      this.value = this.offValue;
    }
  }

  @m.action
  toggle(arg: boolean) {
    if (arg) {
      this.value = this.value < this.toggleThreshold ? this.onValue : this.offValue;
    }
  }

  @m.action({ type: new m.Range(0, 100) })
  setToggleThreshold(arg: number) {
    this.toggleThreshold = arg;
  }

  @m.action({ type: new m.Range(0, 100) })
  setOnValue(arg: number) {
    // Update value in case it is already onValue
    const needUpdate = this.value === this.onValue;

    this.onValue = arg;

    if (needUpdate) {
      this.value = this.onValue;
    }
  }

  @m.action({ type: new m.Range(0, 100) })
  setOffValue(arg: number) {
    // Update value in case it is already offValue
    const needUpdate = this.value === this.offValue;

    this.offValue = arg;

    if (needUpdate) {
      this.value = this.offValue;
    }
  }
};
