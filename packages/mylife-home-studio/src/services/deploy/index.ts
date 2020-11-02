import { Service, BuildParams } from '../types';
import { Recipes } from './recipes';
import { Runs } from './runs';
import { listMeta } from './tasks';

export class Deploy implements Service {
  private readonly recipes = new Recipes;
  private readonly runs = new Runs;

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

//    Services.instance.sessionManager.registerServiceHandler('deploy/list-tasks', session => this.instanceNotifier.startNotify(session));
//    Services.instance.sessionManager.registerServiceHandler('deploy/create-recipe', session => this.instanceNotifier.startNotify(session));
//    Services.instance.sessionManager.registerServiceHandler('deploy/delete-recipe', session => this.instanceNotifier.startNotify(session));
//    Services.instance.sessionManager.registerServiceHandler('deploy/start-recipe', session => this.instanceNotifier.startNotify(session));
}

  async terminate() {
    await this.recipes.terminate();
    await this.runs.terminate();
  }
}
