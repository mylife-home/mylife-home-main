import { EventEmitter } from 'events';
import { logger, bus, tools, instanceInfo } from 'mylife-home-common';
import { UpdateData } from '../../../shared/online';
import { Service, BuildParams } from '../types';
import { Services } from '..';
import { Session, SessionNotifierManager } from '../session-manager';
import { InstanceNotifier } from './instance-notifier';

const log = logger.createLogger('mylife:home:studio:services:online');

export class Online implements Service {
  private readonly instanceNotifier: InstanceNotifier;

  constructor(params: BuildParams) {
    this.instanceNotifier = new InstanceNotifier(params.transport);
  }

  async init() {
    this.instanceNotifier.init();
    Services.instance.sessionManager.registerServiceHandler('online/start-notify-instance-info', session => this.instanceNotifier.startNotifyInstanceInfo(session));
    Services.instance.sessionManager.registerServiceHandler('online/stop-notify-instance-info', (session, payload: any) => this.instanceNotifier.stopNotifyInstanceInfo(session, payload));
  }

  async terminate() {
    this.instanceNotifier.terminate();
  }
}
