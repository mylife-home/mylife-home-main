import { logger, bus, components } from 'mylife-home-common';
import { Component } from '../../../shared/component-model';
import { Session, SessionNotifierManager } from '../session-manager';

const log = logger.createLogger('mylife:home:studio:services:online:history-notifier');

export class HistoryNotifier {
  constructor(private readonly registry: components.Registry) {
  }

  init() {
  }

  terminate() {
  }

  async startNotify(session: Session) {
    return { notifierId: 'TODO' };
  };

  async stopNotify(session: Session, { notifierId }: { notifierId: string; }) {
  };
}
