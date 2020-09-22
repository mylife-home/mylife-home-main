import { logger } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifier, SessionFeature } from './session-manager';

const log = logger.createLogger('mylife:home:studio:services:online');
/*
class SessionNotifiers implements SessionFeature {
  private readonly notifierIds = new Set<string>();

  private static getFromSession(session: Session, createIfNotExist = true) {
    const FEATURE_NAME = 'logging/notifiers';
    const existing = session.findFeature(FEATURE_NAME);
    if(existing) {
      return existing as SessionNotifiers;
    }

    const feature = new SessionNotifiers();
    session.addFeature(FEATURE_NAME, feature);
    return feature;
  }

  static addNotifierId(session: Session, id: string) {
    SessionNotifiers.getFromSession(session).notifierIds.add(id);
  }

  static removeNotifierId(session: Session, id: string) {
    SessionNotifiers.getFromSession(session).notifierIds.delete(id);
  }

  static getNotifierIds(session: Session) {
    const feature = SessionNotifiers.getFromSession(session, false);
    return feature ? [...feature.notifierIds] : [];
  }
}
*/

export class Online implements Service {

  constructor(params: BuildParams) {
  }

  async init() {
  }

  async terminate() {
  }

}
