import { components } from 'mylife-home-core';

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'delay', type: m.ConfigType.FLOAT, description: 'Durée de la minuterie (en secondes)' })
export class Timer {

  private readonly delay: number;
  private pending: NodeJS.Timeout = null;

  constructor({ delay }: { delay: number; }) {
    this.delay = delay;
  }

  @m.state
  value: boolean = false;

  @m.action
  action(arg: boolean) {
    if (!arg) { return; }

    if (this.pending) {
      clearTimeout(this.pending);
    } else {
      this.value = true;
    }

    this.pending = setTimeout(this.clear, this.delay * 1000);
  }

  @m.action
  cancel(arg: boolean) {
    if (arg) {
      this.clear();
    }
  }

  destroy() {
    this.clearPending();
  }

  private readonly clear = () => {
    this.clearPending();
    this.value = false;
  }

  private clearPending() {
    if (this.pending) {
      clearTimeout(this.pending);
      this.pending = null;
    }
  }
};
