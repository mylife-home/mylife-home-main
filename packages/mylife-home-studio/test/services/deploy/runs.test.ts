import { expect } from 'chai';
import path from 'path';
import fs from 'fs-extra';
import * as directories from '../../../src/services/deploy/directories';
import { Recipes } from '../../../src/services/deploy/recipes';
import { Runs } from '../../../src/services/deploy/runs';
import { RecipeConfig, Run, TaskStepConfig } from '../../../shared/deploy';
import { setupDataDirectory } from './utils';

describe('Runs', () => {
  beforeEach(dataDirInit);
  afterEach(dataDirDestroy);

  it('should execute a simple recipe', async () => {
    await setRecipe('recipe', {
      steps: [
        { type: 'task', task: 'variables-set', parameters: { name: 'variable1', value: 'value1' } } as TaskStepConfig,
        { type: 'task', task: 'variables-set', parameters: { name: 'variable2', value: 'value2' } } as TaskStepConfig,
      ] as TaskStepConfig[],
    });

    const { result, events } = await runsScope(async (runs) => {
      const runId = runs.startRecipe('recipe');

      await waitTaskEnd(runs, runId);

      return {
        runs: runs.listRuns(),
        run: stripRunTimes(runs.getRun(runId)),
      };
    });

    expect(result).to.deep.equal({
      runs: ['run-1'],
      run: {
        id: 'run-1',
        recipe: 'recipe',
        status: 'ended',
        err: null,
        logs: [
          { severity: 'info', category: 'recipe', message: "begin 'recipe'" },
          { severity: 'info', category: 'variables:set', message: 'variable1 = value1' },
          { severity: 'info', category: 'variables:set', message: 'variable2 = value2' },
          { severity: 'info', category: 'recipe', message: "end 'recipe'" },
        ],
      },
    });

    expect(stripLogEventTimes(events)).to.deep.equal([
      { name: 'run-created', args: ['run-1', 'recipe'] },
      { name: 'run-begin', args: ['run-1'] },
      { name: 'run-log', args: ['run-1', { severity: 'info', category: 'recipe', message: "begin 'recipe'" }] },
      { name: 'run-log', args: ['run-1', { severity: 'info', category: 'variables:set', message: 'variable1 = value1' }] },
      { name: 'run-log', args: ['run-1', { severity: 'info', category: 'variables:set', message: 'variable2 = value2' }] },
      { name: 'run-log', args: ['run-1', { severity: 'info', category: 'recipe', message: "end 'recipe'" }] },
      { name: 'run-end', args: ['run-1'] },
    ]);
  });

  it('should execute a recipe with real async tasks', async () => {
    await fs.ensureDir(directories.files());
    await fs.symlink(path.resolve(__dirname, 'resources/files/rpi-devel-base.tar.gz'), path.join(directories.files(), 'rpi-devel-base.tar.gz'));

    await setRecipe('recipe', {
      steps: [
        { type: 'task', task: 'image-import', parameters: { archiveName: 'rpi-devel-base.tar.gz', rootPath: 'mmcblk0p1' } } as TaskStepConfig,
        { type: 'task', task: 'config-init', parameters: {} } as TaskStepConfig,
      ] as TaskStepConfig[],
    });

    const { result } = await runsScope(async (runs) => {
      const runId = runs.startRecipe('recipe');

      await waitTaskEnd(runs, runId);

      return stripRunTimes(runs.getRun(runId));
    });

    result.logs = result.logs.filter((it) => it.severity !== 'debug');

    expect(result).to.deep.equal({
      id: 'run-1',
      recipe: 'recipe',
      status: 'ended',
      err: null,
      logs: [
        { severity: 'info', category: 'recipe', message: "begin 'recipe'" },
        { severity: 'info', category: 'image:import', message: "import '/tmp/mylife-home-deploy-test-runs/files/rpi-devel-base.tar.gz' using root path 'mmcblk0p1' into image" },
        { severity: 'info', category: 'config:init', message: "extract config from image file 'rpi-devel.apkovl.tar.gz'" },
        { severity: 'info', category: 'recipe', message: "end 'recipe'" },
      ],
    });
  });
});

const DATA_DIR = '/tmp/mylife-home-deploy-test-runs';

async function dataDirInit() {
  await fs.ensureDir(DATA_DIR);
  setupDataDirectory(DATA_DIR);
}

async function dataDirDestroy() {
  await fs.remove(DATA_DIR);
}

class RunsEvents {
  private readonly listeners: { [key: string]: (...args: any[]) => void; } = {};
  public readonly events: { name: string; args: any[]; }[] = [];

  constructor(private readonly runs: Runs) {
    const eventNames = ['run-log', 'run-created', 'run-begin', 'run-end', 'run-delete'];
    for (const name of eventNames) {
      this.createListener(name);
    }
  }

  close() {
    for (const [name, listener] of Object.entries(this.listeners)) {
      this.runs.removeListener(name, listener);
    }
  }

  private createListener(name: string) {
    const listener = (...args: any[]) => this.events.push({ name, args });
    this.listeners[name] = listener;
    this.runs.on(name, listener);
  }
}

async function runsScope<TResult>(callback: (runs: Runs) => Promise<TResult>) {
  const runs = new Runs();
  await runs.init();
  const me = new RunsEvents(runs);
  try {
    const result = await callback(runs);
    return { result, events: me.events };
  } finally {
    me.close();
    await runs.terminate();
  }
}

async function waitTaskEnd(runs: Runs, runId: string) {
  if (runs.getRun(runId).status === 'ended') {
    return;
  }

  return new Promise<void>((resolve) => {
    const listener = (endRunId: string) => {
      if (endRunId !== runId) {
        return;
      }

      runs.removeListener('run-end', listener);
      resolve();
    };

    runs.on('run-end', listener);
  });
}

function stripRunTimes(run: Run) {
  const { creation, end, logs, ...data } = run;
  return { ...data, logs: logs.map(({ date, ...log }) => log) };
}

function stripLogEventTimes(events: { name: string; args: any[]; }[]) {
  return events.map(event => {
    if (event.name !== 'run-log') {
      return event;
    }

    const { name, args } = event;
    const { date, ...eventData } = args[1];
    const newArgs = [...args];
    newArgs[1] = eventData;
    return { name, args: newArgs };
  });
}

async function setRecipe(name: string, config: RecipeConfig) {
  const recipes = new Recipes();
  await recipes.init();
  recipes.setRecipe(name, config);
  await recipes.terminate();
}