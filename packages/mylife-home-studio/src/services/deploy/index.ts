import { Recipes } from './recipes';
import { Runs } from './runs';
import { Service, BuildParams } from '../types';
import tasks from './tasks';

export class Deploy implements Service {
  private readonly recipes = new Recipes;
  private readonly runs = new Runs;

  constructor(params: BuildParams) {



/*
    TODO: split manager in
     - task metadata
     - recipes store
     - runs

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

//    Services.instance.sessionManager.registerServiceHandler('online/start-notify-instance-info', session => this.instanceNotifier.startNotify(session));
//    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-instance-info', (session, payload: any) => this.instanceNotifier.stopNotify(session, payload));
}

  async terminate() {
    await this.recipes.terminate();
    await this.runs.terminate();
  }

  listTasksMeta() {
    return Object.entries(tasks).map(([name, task]) => ({ name: formatTaskName(name), ...task.metadata }));
  }
}

function formatTaskName(name: string) {
  return name.replace(/^./, (str) => str.toLowerCase()).replace(/([A-Z])/g, (str) => '-' + str.toLowerCase());
}
