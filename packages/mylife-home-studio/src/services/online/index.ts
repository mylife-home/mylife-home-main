import { Service, BuildParams } from '../types';
import { Services } from '..';
import { InstanceNotifier } from './instance-notifier';
import { ComponentNotifier } from './component-notifier';

export class Online implements Service {
  private readonly instanceNotifier: InstanceNotifier;
  private readonly componentNotifier: ComponentNotifier;

  constructor(params: BuildParams) {
    this.instanceNotifier = new InstanceNotifier(params.transport);
    this.componentNotifier = new ComponentNotifier(params.transport);
  }

  async init() {
    await this.instanceNotifier.init();
    await this.componentNotifier.init();

    Services.instance.sessionManager.registerServiceHandler('online/start-notify-instance-info', session => this.instanceNotifier.startNotify(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-instance-info', (session, payload: any) => this.instanceNotifier.stopNotify(session, payload));
    Services.instance.sessionManager.registerServiceHandler('online/start-notify-component', session => this.componentNotifier.startNotify(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-component', (session, payload: any) => this.componentNotifier.stopNotify(session, payload));
  }

  async terminate() {
    await this.instanceNotifier.terminate();
    await this.componentNotifier.terminate();
  }
}
