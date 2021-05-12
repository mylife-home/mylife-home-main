import { Services } from '..';
import { Session, SessionNotifier, SessionNotifierManager } from '../session-manager';
import { Service, BuildParams } from '../types';
import { Pins } from './pins';
import { Runs } from './runs';
import { Files } from './files';
import { listMeta } from './tasks';
import { FsCollection } from '../../utils/fs-collection';

import {
  AddRunLogNotification,
  ClearFileNotification,
  ClearRecipeNotification,
  ClearRunNotification,
  PinRecipeNotification,
  RecipeConfig,
  RunLog,
  SetFileNotification,
  SetRecipeNotification,
  SetRunNotification,
  SetTaskNotification,
} from '../../../shared/deploy';

export class Deploy implements Service {

  private readonly recipes = new FsCollection<RecipeConfig>();
  private readonly pins = new Pins();
  private readonly runs = new Runs();
  private readonly files = new Files();
  private readonly notifiers = new SessionNotifierManager('deploy/notifiers', 'deploy/updates');

  constructor(params: BuildParams) {
    this.recipes.on('create', this.handleRecipeSet);
    this.recipes.on('update', this.handleRecipeSet);
    this.recipes.on('delete', this.handleRecipeClear);

    this.pins.on('pin', this.handleRecipePinned);

    this.runs.on('create', this.handleRunSet);
    this.runs.on('begin', this.handleRunSet);
    this.runs.on('end', this.handleRunSet);
    this.runs.on('delete', this.handleRunClear);
    this.runs.on('log', this.handleRunLog);

    this.files.on('create', this.handleFileSet);
    this.files.on('update', this.handleFileSet);
    this.files.on('delete', this.handleFileClear);
  }

  async init() {
    const paths = Services.instance.pathManager.deploy;

    this.recipes.init(paths.recipes);
    this.pins.init(paths.pins);
    await this.runs.init();
    await this.files.init(paths.files);
    this.notifiers.init();

    Services.instance.sessionManager.registerServiceHandler('deploy/set-recipe', this.setRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/clear-recipe', this.deleteRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/pin-recipe', this.pinRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/start-recipe', this.startRecipe);
    Services.instance.sessionManager.registerServiceHandler('deploy/delete-file', this.deleteFile);
    Services.instance.sessionManager.registerServiceHandler('deploy/rename-file', this.renameFile);
    Services.instance.sessionManager.registerServiceHandler('deploy/read-file', this.readFile);
    Services.instance.sessionManager.registerServiceHandler('deploy/write-file', this.writeFile);

    Services.instance.sessionManager.registerServiceHandler('deploy/start-notify', this.startNotify);
    Services.instance.sessionManager.registerServiceHandler('deploy/stop-notify', this.stopNotify);
  }

  async terminate() {
    await this.pins.terminate();
    await this.recipes.terminate();
    await this.runs.terminate();
    await this.files.terminate();
  }

  private readonly setRecipe = async (session: Session, { id, config }: { id: string; config: RecipeConfig; }) => {
    this.recipes.set(id, config);
  };

  private readonly deleteRecipe = async (session: Session, { id }: { id: string; }) => {
    this.recipes.delete(id);
  };

  private readonly pinRecipe = async (session: Session, { id, value }: { id: string; value: boolean; }) => {
    this.pins.pin(id, value);
  };

  private readonly startRecipe = async (session: Session, { id }: { id: string; }) => {
    return this.runs.startRecipe(id);
  };

  private readonly deleteFile = async (session: Session, { id }: { id: string; }) => {
    return await this.files.delete(id);
  };

  private readonly renameFile = async (session: Session, { id, newId }: { id: string; newId: string; }) => {
    return await this.files.rename(id, newId);
  };

  private readonly readFile = async (session: Session, { id, offset, size }: { id: string; offset: number; size: number; }) => {
    return await this.files.read(id, offset, size);
  };

  private readonly writeFile = async (session: Session, { id, buffer, type }: { id: string; buffer: Buffer; type: 'init' | 'append'; }) => {
    await this.files.write(id, buffer, type);
  };

  private readonly startNotify = async (session: Session) => {
    const notifier = this.notifiers.createNotifier(session);

    setImmediate(() => {
      this.emitTasks(notifier);
      this.emitRecipes(notifier);
      this.emitRuns(notifier);
      this.emitFiles(notifier);
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
    for (const id of this.recipes.ids()) {
      const config = this.recipes.get(id);
      const notification: SetRecipeNotification = { operation: 'recipe-set', id, config };
      notifier.notify(notification);
    }

    for (const id of this.recipes.ids()) {
      if (this.pins.isPinned(id)) {
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

  private emitFiles(notifier: SessionNotifier) {
    for (const file of this.files.listFiles()) {
      const notification: SetFileNotification = { operation: 'file-set', file };
      notifier.notify(notification);
    }
  }

  private readonly stopNotify = async (session: Session, { notifierId }: { notifierId: string; }) => {
    this.notifiers.removeNotifier(session, notifierId);
  };

  private readonly handleRecipeSet = (id: string) => {
    const config = this.recipes.get(id);
    const notification: SetRecipeNotification = { operation: 'recipe-set', id, config };
    this.notifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
  };

  private readonly handleRecipeClear = (id: string) => {
    // on recipe delete, we must remove it from pins
    this.pins.pin(id, false);

    const notification: ClearRecipeNotification = { operation: 'recipe-clear', id };
    this.notifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
  };

  private readonly handleRecipePinned = (id: string, value: boolean) => {
    const notification: PinRecipeNotification = { operation: 'recipe-pin', id, value };
    this.notifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
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

  private readonly handleFileSet = (id: string) => {
    const file = this.files.getFile(id);
    const notification: SetFileNotification = { operation: 'file-set', file };
    this.notifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
  };

  private readonly handleFileClear = (id: string) => {
    const notification: ClearFileNotification = { operation: 'file-clear', id };
    this.notifiers.notifyAll(notification);

    Services.instance.git.notifyFileUpdate();
  };
}
