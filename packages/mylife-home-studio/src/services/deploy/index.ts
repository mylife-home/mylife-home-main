import { RecipeConfig } from '../../../shared/deploy';
import { Services } from '..';
import { Session } from '../session-manager';
import { Service, BuildParams } from '../types';
import { Recipes } from './recipes';
import { Runs } from './runs';
import { listMeta } from './tasks';

export class Deploy implements Service {
  private readonly recipes = new Recipes();
  private readonly runs = new Runs();

  constructor(params: BuildParams) {



    /*
        TODO: split manager in
         - Recipes/Runs => implement notify api + implement services api
         listMeta => implement services api
    
        this.emit(exists ? 'recipe-updated' : 'recipe-created', name);
        this.emit('recipe-deleted', name);
          this.emit('run-log', run.id, log);
        this.emit('run-created', run.id, run.recipe);
        this.emit('run-begin', run.id);
        run.err ? this.emit('run-end', run.id, run.err) : this.emit('run-end', run.id);
          this.emit('run-deleted', run.id);
    */
  }

  async init() {
    await this.recipes.init();
    await this.runs.init();

    //    Services.instance.sessionManager.registerServiceHandler('deploy/start-notify-recipes', session => this.instanceNotifier.startNotify(session));
    //    Services.instance.sessionManager.registerServiceHandler('deploy/stop-notify-recipes', (session, payload: any) => this.instanceNotifier.stopNotify(session, payload));
    //    Services.instance.sessionManager.registerServiceHandler('deploy/start-notify-runs', session => this.instanceNotifier.startNotify(session));
    //    Services.instance.sessionManager.registerServiceHandler('deploy/stop-notify-runs', (session, payload: any) => this.instanceNotifier.stopNotify(session, payload));

    Services.instance.sessionManager.registerServiceHandler('deploy/list-tasks', this.listTasks);
    Services.instance.sessionManager.registerServiceHandler('deploy/create-recipe', this.createRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/delete-recipe', this.deleteRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/start-recipe', this.startRecipe);
  }

  private listTasks = async () => {
    return listMeta();
  };

  private createRecipe = async (session: Session, { name, config }: { name: string; config: RecipeConfig; }) => {
    this.recipes.createRecipe(name, config);
  };

  private deleteRecipe = async (session: Session, { name }: { name: string; }) => {
    this.recipes.deleteRecipe(name);
  };

  private startRecipe = async (session: Session, { name }: { name: string; }) => {
    return this.runs.startRecipe(name);
  };

  async terminate() {
    await this.recipes.terminate();
    await this.runs.terminate();
  }
}
