import fs from 'fs-extra';
import path from 'path';
import { EventEmitter } from 'events';
import { ExecutionContext, Recipe } from './recipe';
import * as directories from '../directories';
import tasks from './tasks';

const RUN_DELETE_TIMEOUT = 10 * 60 * 1000; // 10 mins

export interface RecipeConfig {}

export interface Run {
  id: number;
  recipe: string;
  logs: RunLog[];
  status: 'created' | 'running' | 'ended';
  creation: number;
  end: number;
  err: Error;
}

export interface RunLog {
  date: number;
  category: string;
  severity: RunLogSeverity;
  message: string;
}

export type RunLogSeverity = 'debug' | 'info' | 'warning' | 'error';

export class Manager extends EventEmitter {
  private runIdCounter: number = 0;
  private readonly runs = new Map();
  private readonly pendingTimeouts = new Set<NodeJS.Timeout>();
  private readonly recipes = new Map<string, RecipeConfig>();
  private closing = false;

  constructor() {
    super();

    // load recipes
    fs.ensureDirSync(directories.recipes());

    for (const file of fs.readdirSync(directories.recipes())) {
      const fullname = path.join(directories.recipes(), file);
      const name = path.parse(file).name;
      const content = JSON.parse(fs.readFileSync(fullname, 'utf8'));

      this.recipes.set(name, content);
    }
  }

  listTasksMeta() {
    return Object.entries(tasks).map(([name, task]) => ({ name: formatTaskName(name), ...task.metadata }));
  }

  createRecipe(name: string, content: RecipeConfig) {
    fs.ensureDirSync(directories.recipes());

    const fullname = path.join(directories.recipes(), name + '.json');
    const exists = fs.existsSync(fullname);
    fs.writeFileSync(fullname, JSON.stringify(content));

    this.recipes.set(name, content);
    this.emit(exists ? 'recipe-updated' : 'recipe-created', name);
  }

  deleteRecipe(name: string) {
    fs.ensureDirSync(directories.recipes());

    const fullname = path.join(directories.recipes(), name + '.json');
    if (!fs.existsSync(fullname)) {
      return;
    }

    fs.unlinkSync(fullname);

    this.recipes.delete(name);
    this.emit('recipe-deleted', name);
  }

  listRecipes() {
    return Array.from(this.recipes.keys());
  }

  // no copy!
  getRecipe(name: string) {
    return this.recipes.get(name);
  }

  startRecipe(name: string) {
    if (this.closing) {
      throw new Error('Cannot start recipe while closing manager');
    }

    let runId: number;
    this.once('run-begin', (id) => {
      runId = id;
    });

    this.runRecipe(name);
    return runId;
  }

  async close() {
    this.closing = true;

    // wait pending runs
    let pendingsCount = Array.from(this.runs.values()).filter((run) => run.status === 'running').length;
    if (pendingsCount) {
      await new Promise((resolve) =>
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

  async runRecipe(name: string) {
    if (this.closing) {
      throw new Error('Cannot start recipe while closing manager');
    }

    const run: Run = {
      id: ++this.runIdCounter,
      recipe: name,
      logs: [],
      status: 'created',
      creation: Date.now(),
      end: null,
      err: null,
    };

    const logger = (category: string, severity: RunLogSeverity, message: string) => {
      const log = { date: Date.now(), category, severity, message };
      run.logs.push(log);
      this.emit('run-log', run.id, log);
    };

    this.runs.set(run.id, run);
    this.emit('run-created', run.id, run.recipe);

    run.status = 'running';
    this.emit('run-begin', run.id);

    try {
      const recipe = new Recipe(name);
      const context: ExecutionContext = { logger, root: null, config: null, variables: null };

      await recipe.execute(context);
    } catch (err) {
      run.err = err;
    }

    run.status = 'ended';
    run.end = Date.now();
    run.err ? this.emit('run-end', run.id, run.err) : this.emit('run-end', run.id);

    const timeout = setTimeout(() => {
      this.emit('run-deleted', run.id);
      this.runs.delete(run.id);
      this.pendingTimeouts.delete(timeout);
    }, RUN_DELETE_TIMEOUT);

    this.pendingTimeouts.add(timeout);
  }

  listRuns() {
    return Array.from(this.runs.keys());
  }

  getRun(runId: number, withLogs = true) {
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
}

function formatTaskName(name: string) {
  return name.replace(/^./, (str) => str.toLowerCase()).replace(/([A-Z])/g, (str) => '-' + str.toLowerCase());
}
