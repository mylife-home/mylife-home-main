import { RecipeConfig, RunLog } from '../../../shared/deploy';
import { Services } from '..';
import { Session, SessionNotifierManager } from '../session-manager';
import { Service, BuildParams } from '../types';
import { Recipes } from './recipes';
import { Runs } from './runs';
import { listMeta } from './tasks';

export class Deploy implements Service {
  private readonly recipes = new Recipes();
  private readonly runs = new Runs();
  private readonly recipeNotifiers = new SessionNotifierManager('deploy/recipe-notifiers', 'deploy/recipes');
  private readonly runNotifiers = new SessionNotifierManager('deploy/run-notifiers', 'deploy/runs');

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

    Services.instance.sessionManager.registerServiceHandler('deploy/list-tasks', this.listTasks);
    Services.instance.sessionManager.registerServiceHandler('deploy/create-recipe', this.createRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/delete-recipe', this.deleteRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/start-recipe', this.startRecipe);

    Services.instance.sessionManager.registerServiceHandler('deploy/start-notify-recipes', this.startNotifyRecipes);
    Services.instance.sessionManager.registerServiceHandler('deploy/stop-notify-recipes', this.stopNotifyRecipes);
    Services.instance.sessionManager.registerServiceHandler('deploy/start-notify-runs', this.startNotifyRuns);
    Services.instance.sessionManager.registerServiceHandler('deploy/stop-notify-runs', this.stopNotifyRuns);
  }

  async terminate() {
    await this.recipes.terminate();
    await this.runs.terminate();
  }

  private readonly listTasks = async () => {
    return listMeta();
  };

  private readonly createRecipe = async (session: Session, { name, config }: { name: string; config: RecipeConfig; }) => {
    this.recipes.createRecipe(name, config);
  };

  private readonly deleteRecipe = async (session: Session, { name }: { name: string; }) => {
    this.recipes.deleteRecipe(name);
  };

  private readonly startRecipe = async (session: Session, { name }: { name: string; }) => {
    return this.runs.startRecipe(name);
  };

  private readonly startNotifyRecipes = async (session: Session) => {
    const notifier = this.recipeNotifiers.createNotifier(session);

    setImmediate(() => {
      for (const record of records) {
        notifier.notify(record);
      }
    });

    return { notifierId: notifier.id };
  };

  private readonly stopNotifyRecipes = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.recipeNotifiers.removeNotifier(session, notifierId);
  };

  private readonly startNotifyRuns = async (session: Session) => {
    const notifier = this.runNotifiers.createNotifier(session);

    setImmediate(() => {
      for (const record of records) {
        notifier.notify(record);
      }
    });

    return { notifierId: notifier.id };
  };

  private readonly stopNotifyRuns = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.runNotifiers.removeNotifier(session, notifierId);
  };

  private readonly handleRecipeSet = (name: string) => {

  };

  private readonly handleRecipeClear = (name: string) => {

  };

  private readonly handleRunSet = (id: number) => {

  };

  private readonly handleRunClear = (id: number) => {

  };

  private readonly handleRunLog = (id: number, log: RunLog) => {

  };
}
