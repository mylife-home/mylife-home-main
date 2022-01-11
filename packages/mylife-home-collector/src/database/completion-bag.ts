import { tools } from 'mylife-home-common';

export class CompletionBag {
  private readonly pendings = new Set<Object>();
  private waitCallback: () => void;

  addTask(task: Promise<unknown>) {
    const cookie = {};

    this.pendings.add(cookie);
    task.finally(() => {
      this.pendings.delete(cookie);
      if (this.pendings.size === 0 && this.waitCallback) {
        this.waitCallback();
      }
    });
  }

  async wait() {
    if (this.waitCallback) {
      throw new Error('wait called 2 times');
    }

    if (this.pendings.size === 0) {
      return;
    }

    const deferred = new tools.Deferred<void>();
    this.waitCallback = deferred.resolve;
    await deferred.promise;
    this.waitCallback = null;
  }
}