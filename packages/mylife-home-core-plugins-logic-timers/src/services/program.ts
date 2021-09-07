import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:logic-timers:services:program');

const OUTPUTS = new Map<string, OutputKey>();
for (let i = 0; i < 10; ++i) {
  OUTPUTS.set(`o${i}`, `output${i}` as OutputKey);
}

const TIMER_SUFFIXES: { [suffix: string]: number; } = {
  's': 1000,
  'm': 60 * 1000,
  'h': 60 * 60 * 1000
};

export type OutputKey = 'output0' | 'output1' | 'output2' | 'output3' | 'output4' | 'output5' | 'output6' | 'output7' | 'output8' | 'output9';

export default abstract class Program<Value> {
  private steps: Step[];
  private totalWait: number;

  private currentStepIndex: number = -1;
  private startTime: number = null;
  private currentProgressTimer: NodeJS.Timeout;

  constructor(private readonly source: string, private readonly canWait: boolean) {
  }

  setup() {
    this.reset();
    this.parse();
  }

  protected abstract parseOutputValue(value: string): Value;
  protected abstract setOutput(name: OutputKey, value: Value): void;
  protected abstract setProgress(value: number): void;
  protected abstract setRunning(value: boolean): void;

  private parse() {
    this.steps = this.source.split(/(?:\|| )+/).map(part => {
      const items = part.split('-');
      if (items.length !== 2) {
        throw new Error(`Invalid program: Invalid step: '${part}'`);
      }

      const [op, arg] = items;
      return this.createStep(op, arg);
    });

    this.totalWait = this.steps
      .filter(step => step instanceof WaitStep)
      .reduce((prev, step) => prev + (step as WaitStep).delay, 0);
  }

  private createStep(op: string, arg: string) {
    const outputKey = OUTPUTS.get(op);
    if (outputKey) {
      const value = this.parseOutputValue(arg);
      return new SetOutputStep<Value>(outputKey, value, (name, value) => this.setOutput(name, value));
    }

    if (op === 'o*') {
      const value = this.parseOutputValue(arg);
      return new SetAllOutputsStep<Value>(value, (name, value) => this.setOutput(name, value));
    }

    if (op === 'w') {
      if (!this.canWait) {
        throw new Error('Invalid program: wait not allowed');
      }

      return new WaitStep(arg);
    }

    throw new Error(`Invalid program: Invalid step operation: '${op}'`);
  }

  run() {
    this.currentStepIndex = -1;
    this.startTime = clock();

    this.executeStep();
    this.executeProgress();
  }

  private executeProgress() {
    const PROGRESS_TIMER = 1000;

    if (this.totalWait === 0) {
      // no wait in the program -> no time, no progress
      this.setProgress(0);
      return;
    }

    const progressTime = clock() - this.startTime;
    const progress = Math.round((progressTime / this.totalWait) * 100);
    this.setProgress(progress);

    this.currentProgressTimer = setTimeout(() => this.executeProgress(), PROGRESS_TIMER);
  }

  private executeStep() {
    try {
      const step = this.steps[++this.currentStepIndex];
      if (!step) {
        // terminated
        this.reset();
        return;
      }

      this.setRunning(true);
      const done = () => this.executeStep();
      step.execute(done);

    } catch (err) {
      log.error(err, `Error running step index ${this.currentStepIndex}`, this.currentStepIndex);
      this.reset();
    }
  }

  interrupt() {
    if (this.running) {
      this.reset();
    }
  }

  private reset() {
    clearTimeout(this.currentProgressTimer);
    this.currentProgressTimer = null;
    this.currentStepIndex = -1;
    this.startTime = null;
    this.setProgress(0);
    this.setRunning(false);
  }

  get running() {
    const currentStep = this.steps[this.currentStepIndex];
    return !!currentStep;
  }
};

type Done = () => void;

abstract class Step {
  abstract execute(done: Done): void;
  abstract interrupt(): void;
}

class WaitStep extends Step {
  public readonly delay: number;
  private timer: NodeJS.Timeout;

  constructor(arg: string) {
    super();

    let delay = parseInt(arg);
    if (isNaN(delay)) {
      throw new Error(`Invalid program: Invalid wait: '${arg}'`);
    }

    const suffix = arg.substring(delay.toString().length);
    if (suffix) {
      const mul = TIMER_SUFFIXES[suffix];
      if (!mul) {
        throw new Error(`Invalid program: Invalid wait: '${arg}'`);
      }

      delay *= mul;
    }

    this.delay = delay;
  }

  execute(done: Done) {
    const onTimeout = () => {
      this.timer = null;
      done();
    };

    this.timer = setTimeout(onTimeout, this.delay);
  }

  interrupt() {
    clearTimeout(this.timer);
    this.timer = null;
  }
}

class SetOutputStep<Value> extends Step {
  constructor(private readonly output: OutputKey, private readonly value: Value, private readonly setOutput: (name: OutputKey, value: Value) => void) {
    super();
  }

  execute(done: Done) {
    this.setOutput(this.output, this.value);
    done();
  }

  interrupt() {
    throw new Error('Cannot interrupt sync step');
  }
}

class SetAllOutputsStep<Value> extends Step {
  constructor(private readonly value: Value, private readonly setOutput: (name: OutputKey, value: Value) => void) {
    super();
  }

  execute(done: Done) {
    for (const output of OUTPUTS.values()) {
      this.setOutput(output, this.value);
    }

    done();
  }

  interrupt() {
    throw new Error('Cannot interrupt sync step');
  }
}

function clock() {
  const hrtime = process.hrtime();
  return hrtime[0] * 1e6 + hrtime[1] / 1e3;
}
