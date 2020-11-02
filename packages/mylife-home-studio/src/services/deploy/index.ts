import { components, tools } from 'mylife-home-common';
import { Manager } from './manager';
import { Service, BuildParams } from '../types';

// TODO: logs

export class Deploy implements Service {
  private readonly manager = new Manager;

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
    await this.manager.init();

//    Services.instance.sessionManager.registerServiceHandler('online/start-notify-instance-info', session => this.instanceNotifier.startNotify(session));
//    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-instance-info', (session, payload: any) => this.instanceNotifier.stopNotify(session, payload));
}

  async terminate() {
    await this.manager.terminate();
  }
}
