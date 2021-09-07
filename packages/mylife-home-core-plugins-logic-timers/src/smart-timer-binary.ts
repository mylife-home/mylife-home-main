import { components } from 'mylife-home-core';
import Program, { OutputKey } from './services/program';

import m = components.metadata;

class BinaryProgram extends Program<boolean> {

  constructor(source: string, canWait: boolean, private readonly owner: SmartTimerBinary) {
    super(source, canWait);
  }

  protected parseOutputValue(value: string) {
    switch (value) {
      case 'on':
        return true;
      case 'off':
        return false;
    }

    throw new Error(`Invalid out value: '${value}'`);
  }

  protected setOutput(name: OutputKey, value: boolean) {
    this.owner[name] = value;
  }

  protected setProgress(value: number) {
    this.owner.progress = value;
  }

  protected setRunning(value: boolean) {
    this.owner.running = value;
  }
};

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'initProgram', type: m.ConfigType.STRING, description: 'Programme executé à l\'initialisation du composant. Ex: "o*-off" (Ne doit pas contenir de wait)' })
@m.config({ name: 'triggerProgram', type: m.ConfigType.STRING, description: 'Programme principal, lancé sur déclencheur. Ex: "o0-on w-1s o0-off o1-on w-1s o1-off"' })
@m.config({ name: 'cancelProgram', type: m.ConfigType.STRING, description: 'Programme executé à l\'arrêt de triggerProgram. Ex: "o*-off" (Ne doit pas contenir de wait)' })
export class SmartTimerBinary {
  private readonly initProgram: BinaryProgram;
  private readonly triggerProgram: BinaryProgram;
  private readonly cancelProgram: BinaryProgram;

  constructor(config: { initProgram: string; triggerProgram: string; cancelProgram: string; }) {
    this.initProgram = new BinaryProgram(config.initProgram, false, this);
    this.triggerProgram = new BinaryProgram(config.triggerProgram, true, this);
    this.cancelProgram = new BinaryProgram(config.cancelProgram, false, this);

    this.initProgram.setup();
    this.triggerProgram.setup();
    this.cancelProgram.setup();

    this.initProgram.run();
  }

  @m.state({ type: new m.Range(0, 100) })
  progress: number = 0;

  @m.state
  running: boolean = false;

  @m.state
  output0: boolean = false;

  @m.state
  output1: boolean = false;

  @m.state
  output2: boolean = false;

  @m.state
  output3: boolean = false;

  @m.state
  output4: boolean = false;

  @m.state
  output5: boolean = false;

  @m.state
  output6: boolean = false;

  @m.state
  output7: boolean = false;

  @m.state
  output8: boolean = false;

  @m.state
  output9: boolean = false;

  @m.action
  trigger(arg: boolean) {
    if (!arg) { return; }

    this.clear();
    this.triggerProgram.run();
  }

  @m.action
  cancel(arg: boolean) {
    if (!arg) { return; }

    this.clear();
  }

  @m.action
  toggle(arg: boolean) {
    if (this.triggerProgram.running) {
      this.cancel(arg);
    } else {
      this.trigger(arg);
    }
  }

  destroy() {
    this.clear();
  }

  private clear() {
    if (this.triggerProgram.running) {
      this.triggerProgram.interrupt();
      this.cancelProgram.run();
    }
  }
};

