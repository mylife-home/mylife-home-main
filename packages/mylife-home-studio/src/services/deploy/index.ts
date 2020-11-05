import { AddRunLogNotification, ClearRecipeNotification, ClearRunNotification, RecipeConfig, RunLog, SetRecipeNotification, SetRunNotification, SetTaskNotification } from '../../../shared/deploy';
import { Services } from '..';
import { Session, SessionNotifier, SessionNotifierManager } from '../session-manager';
import { Service, BuildParams } from '../types';
import { Recipes } from './recipes';
import { Runs } from './runs';
import { listMeta } from './tasks';

// TODO: files management API

export class Deploy implements Service {
  private readonly recipes = new Recipes();
  private readonly runs = new Runs();
  private readonly notifiers = new SessionNotifierManager('deploy/notifiers', 'deploy/events');

  constructor(params: BuildParams) {
    this.recipes.on('recipe-created', this.handleRecipeSet);
    this.recipes.on('recipe-updated', this.handleRecipeSet);
    this.recipes.on('recipe-deleted', this.handleRecipeClear);

    this.runs.on('run-created', this.handleRunSet);
    this.runs.on('run-begin', this.handleRunSet);
    this.runs.on('run-end', this.handleRunSet);
    this.runs.on('run-deleted', this.handleRunClear);
    this.runs.on('run-log', this.handleRunLog);
  }

  async init() {
    await this.recipes.init();
    await this.runs.init();
    this.notifiers.init();

    Services.instance.sessionManager.registerServiceHandler('deploy/create-recipe', this.createRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/delete-recipe', this.deleteRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/start-recipe', this.startRecipe);

    Services.instance.sessionManager.registerServiceHandler('deploy/start-notify', this.startNotify);
    Services.instance.sessionManager.registerServiceHandler('deploy/stop-notify', this.stopNotify);
  }

  async terminate() {
    await this.recipes.terminate();
    await this.runs.terminate();
  }

  private readonly createRecipe = async (session: Session, { name, config }: { name: string; config: RecipeConfig; }) => {
    this.recipes.createRecipe(name, config);
  };

  private readonly deleteRecipe = async (session: Session, { name }: { name: string; }) => {
    this.recipes.deleteRecipe(name);
  };

  private readonly startRecipe = async (session: Session, { name }: { name: string; }) => {
    return this.runs.startRecipe(name);
  };

  private readonly startNotify = async (session: Session) => {
    const notifier = this.notifiers.createNotifier(session);

    setImmediate(() => {
      this.emitTasks(notifier);
      this.emitRecipes(notifier);
      this.emitRuns(notifier);
    });

    return { notifierId: notifier.id };
  };

  private emitTasks(notifier: SessionNotifier) {
    for (const metadata of listMeta()) {
      const notification: SetTaskNotification = { type: 'task', operation: 'set', metadata };
      notifier.notify(notification);
    }
  }

  private emitRecipes(notifier: SessionNotifier) {
    for (const name of this.recipes.listRecipes()) {
      const config = this.recipes.getRecipe(name);
      const notification: SetRecipeNotification = { type: 'recipe', operation: 'set', name, config };
      notifier.notify(notification);
    }
  }

  private emitRuns(notifier: SessionNotifier) {
    for (const id of this.runs.listRuns()) {
      const run = this.runs.getRun(id);
      const logs = run.logs;
      run.logs = null;

      const notification: SetRunNotification = { type: 'run', operation: 'set', run };
      notifier.notify(notification);

      for (const log of logs) {
        const notification: AddRunLogNotification = { type: 'run', operation: 'add-log', id, log };
        notifier.notify(notification);
      }
    }
  }

  private readonly stopNotify = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.notifiers.removeNotifier(session, notifierId);
  };

  private readonly handleRecipeSet = (name: string) => {
    const config = this.recipes.getRecipe(name);
    const notification: SetRecipeNotification = { type: 'recipe', operation: 'set', name, config };
    this.notifiers.notifyAll(notification);
  };

  private readonly handleRecipeClear = (name: string) => {
    const notification: ClearRecipeNotification = { type: 'recipe', operation: 'clear', name };
    this.notifiers.notifyAll(notification);
  };

  private readonly handleRunSet = (id: number) => {
    const run = this.runs.getRun(id, false);
    const notification: SetRunNotification = { type: 'run', operation: 'set', run };
    this.notifiers.notifyAll(notification);
  };

  private readonly handleRunClear = (id: number) => {
    const notification: ClearRunNotification = { type: 'run', operation: 'clear', id };
    this.notifiers.notifyAll(notification);
  };

  private readonly handleRunLog = (id: number, log: RunLog) => {
    const notification: AddRunLogNotification = { type: 'run', operation: 'add-log', id, log };
    this.notifiers.notifyAll(notification);
  };
}
