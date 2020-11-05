import { AddRunLogNotification, ClearRecipeNotification, ClearRunNotification, PinRecipeNotification, RecipeConfig, RunLog, SetRecipeNotification, SetRunNotification, SetTaskNotification } from '../../../shared/deploy';
import { Services } from '..';
import { Session, SessionNotifier, SessionNotifierManager } from '../session-manager';
import { Service, BuildParams } from '../types';
import { Recipes } from './recipes';
import { Runs } from './runs';
import { listMeta } from './tasks';
import * as directories from './directories';

// TODO: files management API

export class Deploy implements Service {
  private readonly recipes = new Recipes();
  private readonly runs = new Runs();
  private readonly notifiers = new SessionNotifierManager('deploy/notifiers', 'deploy/updates');

  constructor(params: BuildParams) {
    this.recipes.on('recipe-created', this.handleRecipeSet);
    this.recipes.on('recipe-updated', this.handleRecipeSet);
    this.recipes.on('recipe-deleted', this.handleRecipeClear);
    this.recipes.on('recipe-pinned', this.handleRecipePinned);

    this.runs.on('run-created', this.handleRunSet);
    this.runs.on('run-begin', this.handleRunSet);
    this.runs.on('run-end', this.handleRunSet);
    this.runs.on('run-deleted', this.handleRunClear);
    this.runs.on('run-log', this.handleRunLog);
  }

  async init() {
    directories.configure();
    await this.recipes.init();
    await this.runs.init();
    this.notifiers.init();

    Services.instance.sessionManager.registerServiceHandler('deploy/create-recipe', this.setRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/delete-recipe', this.deleteRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/start-recipe', this.startRecipe);

    Services.instance.sessionManager.registerServiceHandler('deploy/start-notify', this.startNotify);
    Services.instance.sessionManager.registerServiceHandler('deploy/stop-notify', this.stopNotify);
  }

  async terminate() {
    await this.recipes.terminate();
    await this.runs.terminate();
  }

  private readonly setRecipe = async (session: Session, { id, config }: { id: string; config: RecipeConfig; }) => {
    this.recipes.setRecipe(id, config);
  };

  private readonly deleteRecipe = async (session: Session, { id }: { id: string; }) => {
    this.recipes.deleteRecipe(id);
  };

  private readonly startRecipe = async (session: Session, { id }: { id: string; }) => {
    return this.runs.startRecipe(id);
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
    for (const { id, metadata } of listMeta()) {
      const notification: SetTaskNotification = { operation: 'task-set', id, metadata };
      notifier.notify(notification);
    }
  }

  private emitRecipes(notifier: SessionNotifier) {
    for (const id of this.recipes.listRecipes()) {
      const config = this.recipes.getRecipe(id);
      const notification: SetRecipeNotification = { operation: 'recipe-set', id, config };
      notifier.notify(notification);
    }

    for (const id of this.recipes.listRecipes()) {
      if (this.recipes.isPinned(id)) {
        const notification: PinRecipeNotification = { operation: 'recipe-pin', id, value: true };
        notifier.notify(notification);
      }
    }
  }

  private emitRuns(notifier: SessionNotifier) {
    for (const id of this.runs.listRuns()) {
      const run = this.runs.getRun(id);
      const logs = run.logs;
      run.logs = null;

      const notification: SetRunNotification = { operation: 'run-set', run };
      notifier.notify(notification);

      for (const log of logs) {
        const notification: AddRunLogNotification = { operation: 'run-add-log', id, log };
        notifier.notify(notification);
      }
    }
  }

  private readonly stopNotify = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.notifiers.removeNotifier(session, notifierId);
  };

  private readonly handleRecipeSet = (id: string) => {
    const config = this.recipes.getRecipe(id);
    const notification: SetRecipeNotification = { operation: 'recipe-set', id, config };
    this.notifiers.notifyAll(notification);
  };

  private readonly handleRecipeClear = (id: string) => {
    const notification: ClearRecipeNotification = { operation: 'recipe-clear', id };
    this.notifiers.notifyAll(notification);
  };

  private readonly handleRecipePinned = (id: string, value: boolean) => {
    const notification: PinRecipeNotification = { operation: 'recipe-pin', id, value };
    this.notifiers.notifyAll(notification);
  };

  private readonly handleRunSet = (id: string) => {
    const run = this.runs.getRun(id, false);
    const notification: SetRunNotification = { operation: 'run-set', run };
    this.notifiers.notifyAll(notification);
  };

  private readonly handleRunClear = (id: string) => {
    const notification: ClearRunNotification = { operation: 'run-clear', id };
    this.notifiers.notifyAll(notification);
  };

  private readonly handleRunLog = (id: string, log: RunLog) => {
    const notification: AddRunLogNotification = { operation: 'run-add-log', id, log };
    this.notifiers.notifyAll(notification);
  };
}
