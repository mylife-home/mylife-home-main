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
  private startTime: bigint = null;
  private currentProgressTimer: NodeJS.Timeout;

  constructor(private readonly source: string, private readonly canWait: boolean) {
  }

  setup() {
    this.parse();
    this.reset();
  }

  protected abstract parseOutputValue(value: string): Value;
  protected abstract setOutput(name: OutputKey, value: Value): void;
  protected abstract setProgress(percent: number, progressTime: number): void;
  protected abstract setRunning(value: boolean): void;

  private parse() {
    try {
      this.steps = this.source.split(/(?:\|| )+/).map(part => {
        const items = part.split('-');
        if (items.length !== 2) {
          throw new Error(`Invalid program: Invalid step: '${part}'`);
        }

        const [op, arg] = items;
        return this.createStep(op, arg);
      });
    } catch(err) {
      log.error(err, 'Invalid program. Will fallback to empty program.');
      this.steps = [];
    }

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
    this.startTime = process.hrtime.bigint();

    this.executeStep();
    this.executeProgress();
  }

  private executeProgress() {
    const PROGRESS_TIMER = 1000;

    if (this.totalWait === 0) {
      // no wait in the program -> no time, no progress
      this.setProgress(0, 0);
      return;
    }

    const progressTime = Number(process.hrtime.bigint() - this.startTime) / 1e6;
    const percent = Math.round((progressTime / this.totalWait) * 100);
    this.setProgress(percent, progressTime / 1000);

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
      log.debug(`Running step index ${this.currentStepIndex}`);
      const done = () => this.executeStep();
      step.execute(done);

    } catch (err) {
      log.error(err, `Error running step index ${this.currentStepIndex}`);
      this.reset();
    }
  }

  interrupt() {
    if (this.running) {
      this.reset();
    }
  }

  private reset() {
    const currentStep = this.steps[this.currentStepIndex];
    currentStep?.interrupt();
    this.currentStepIndex = -1;

    clearTimeout(this.currentProgressTimer);
    this.currentProgressTimer = null;
    
    this.startTime = null;

    this.setProgress(0, 0);
    this.setRunning(false);
  }

  get running() {
    const currentStep = this.steps[this.currentStepIndex];
    return !!currentStep;
  }

  // in seconds
  get totalTime() {
    return this.totalWait / 1000;
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
    log.debug(`Execute WaitStep: sleep '${this.delay}' ms`);

    const onTimeout = () => {
      this.timer = null;
      done();
    };

    this.timer = setTimeout(onTimeout, this.delay);
  }

  interrupt() {
    log.debug('Interrupt WaitStep');
    clearTimeout(this.timer);
    this.timer = null;
  }
}

class SetOutputStep<Value> extends Step {
  constructor(private readonly output: OutputKey, private readonly value: Value, private readonly setOutput: (name: OutputKey, value: Value) => void) {
    super();
  }

  execute(done: Done) {
    log.debug(`Execute SetOutputStep: set '${this.output}' to '${this.value}'`);
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
    log.debug(`Execute SetAllOutputsStep: set all outputs to '${this.value}'`);
    for (const output of OUTPUTS.values()) {
      this.setOutput(output, this.value);
    }

    done();
  }

  interrupt() {
    throw new Error('Cannot interrupt sync step');
  }
}
