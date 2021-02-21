import { EventEmitter } from 'events';
import { logger } from 'mylife-home-common';
import { ExecutionContext, Recipe } from './recipe';
import { Run, RunError, RunLog, RunLogSeverity } from '../../../shared/deploy';

const log = logger.createLogger('mylife:home:studio:services:deploy:runs');

const RUN_DELETE_TIMEOUT = 10 * 60 * 1000; // 10 mins

export class Runs extends EventEmitter {
  private runIdCounter: number = 0;
  private readonly runs = new Map<string, Run>();
  private readonly pendingTimeouts = new Set<NodeJS.Timeout>();
  private closing = false;

  listRuns() {
    return Array.from(this.runs.keys());
  }

  getRun(runId: string, withLogs = true): Run {
    const run = this.runs.get(runId);
    if (!run) {
      return;
    }

    const ret = { ...run };
    if (!withLogs) {
      ret.logs = null;
    }
    return ret;
  }

  startRecipe(recipe: string) {
    if (this.closing) {
      throw new Error('Cannot start recipe while closing manager');
    }

    let runId: string;
    this.once('run-begin', (id) => {
      runId = id;
    });

    this.runRecipe(recipe);
    return runId;
  }

  async init() {
  }

  async terminate() {
    this.closing = true;

    // wait pending runs
    let pendingsCount = Array.from(this.runs.values()).filter((run) => run.status === 'running').length;
    if (pendingsCount) {
      await new Promise<void>((resolve) =>
        this.on('run-end', () => {
          if (--pendingsCount === 0) {
            resolve();
          }
        })
      );
    }

    // do not wait delete timeout
    for (const pending of this.pendingTimeouts) {
      clearTimeout(pending);
    }

    this.pendingTimeouts.clear();
    this.runs.clear();
  }

  private async runRecipe(recipeId: string) {
    if (this.closing) {
      throw new Error('Cannot start recipe while closing manager');
    }

    const run: Run = {
      id: `run-${++this.runIdCounter}`,
      recipe: recipeId,
      logs: [],
      status: 'created',
      creation: Date.now(),
      end: null,
      err: null,
    };

    const logger = (category: string, severity: RunLogSeverity, message: string) => {
      const log: RunLog = { date: Date.now(), category, severity, message };
      run.logs.push(log);
      this.emit('run-log', run.id, log);
    };

    this.runs.set(run.id, run);
    this.emit('run-created', run.id, run.recipe);
    log.info(`run '${run.id}' started from recipe '${run.recipe}'`);

    run.status = 'running';
    this.emit('run-begin', run.id);

    try {
      const recipe = new Recipe(recipeId);
      const context: ExecutionContext = { logger, root: null, config: null, variables: null };

      await recipe.execute(context);
    } catch (err) {
      run.err = formatError(err);
      log.error(err, `run '${run.id}' error`);
    }

    run.status = 'ended';
    run.end = Date.now();
    run.err ? this.emit('run-end', run.id, run.err) : this.emit('run-end', run.id);
    log.info(`run '${run.id}' ended`);

    const timeout = setTimeout(() => {
      this.emit('run-deleted', run.id);
      this.runs.delete(run.id);
      this.pendingTimeouts.delete(timeout);
    }, RUN_DELETE_TIMEOUT);

    this.pendingTimeouts.add(timeout);
  }
}

function formatError(err: Error): RunError {
  const { message, stack } = err;
  const name = err.constructor.name;
  return { message, stack, name };
}