export abstract class BasePlugin {
  constructor(readonly configKey: string) {

  }

  destroy() {

  }

  protected abstract onStateChanged(name: string, value: string): void;

  protected executeAction(arg: string) {

  }
}