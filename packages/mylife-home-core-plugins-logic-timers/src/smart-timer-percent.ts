import { components } from 'mylife-home-core';
import Program, { OutputKey } from './services/program';

import m = components.metadata;

class PercentProgram extends Program<number> {

  constructor(source: string, canWait: boolean, private readonly owner: SmartTimerPercent) {
    super(source, canWait);
  }

  protected parseOutputValue(value: string) {
    const ivalue = parseInt(value);
    if(isNaN(ivalue) || ivalue < 0 || ivalue > 100) {
      throw new Error(`Invalid output value: '${value}'`);
    }
    return ivalue;
  }

  protected setOutput(name: OutputKey, value: number) {
    this.owner[name] = value;
  }

  protected setProgress(percent: number, progressTime: number) {
    this.owner.progressTime = progressTime;
    this.owner.progress = percent;
  }

  protected setRunning(value: boolean) {
    this.owner.running = value;
  }
};

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'initProgram', type: m.ConfigType.STRING, description: 'Programme executé à l\'initialisation du composant. Ex: "o*-0" (Ne doit pas contenir de wait)' })
@m.config({ name: 'triggerProgram', type: m.ConfigType.STRING, description: 'Programme principal, lancé sur déclencheur. Ex: "o0-50 w-1s o0-100 o1-50 w-1s o0-0 o1-0"' })
@m.config({ name: 'cancelProgram', type: m.ConfigType.STRING, description: 'Programme executé à l\'arrêt de triggerProgram. Ex: "o*-0" (Ne doit pas contenir de wait)' })
export class SmartTimerPercent {
  private readonly initProgram: PercentProgram;
  private readonly triggerProgram: PercentProgram;
  private readonly cancelProgram: PercentProgram;

  constructor(config: { initProgram: string; triggerProgram: string; cancelProgram: string; }) {
    this.initProgram = new PercentProgram(config.initProgram, false, this);
    this.triggerProgram = new PercentProgram(config.triggerProgram, true, this);
    this.cancelProgram = new PercentProgram(config.cancelProgram, false, this);

    this.initProgram.setup();
    this.triggerProgram.setup();
    this.cancelProgram.setup();

    this.initProgram.run();

    this.totalTime = this.triggerProgram.totalTime;
  }

  @m.state({ type: new m.Float(), description: 'Temps total du programme, en secondes' })
  totalTime: number = 0;

  @m.state({ type: new m.Float(), description: 'Temps écoulé du programme, en secondes' })
  progressTime: number = 0;

  @m.state({ type: new m.Range(0, 100), description: 'Pourcentage du programme accompli' })
  progress: number = 0;

  @m.state
  running: boolean = false;

  @m.state({ type: new m.Range(0, 100) })
  output0: number = 0;

  @m.state({ type: new m.Range(0, 100) })
  output1: number = 0;

  @m.state({ type: new m.Range(0, 100) })
  output2: number = 0;

  @m.state({ type: new m.Range(0, 100) })
  output3: number = 0;

  @m.state({ type: new m.Range(0, 100) })
  output4: number = 0;

  @m.state({ type: new m.Range(0, 100) })
  output5: number = 0;

  @m.state({ type: new m.Range(0, 100) })
  output6: number = 0;

  @m.state({ type: new m.Range(0, 100) })
  output7: number = 0;

  @m.state({ type: new m.Range(0, 100) })
  output8: number = 0;

  @m.state({ type: new m.Range(0, 100) })
  output9: number = 0;

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
