import { logger } from 'mylife-home-common';
import { Service, BuildParams } from './types';
import { Services } from '.';
import { Session, SessionNotifierManager } from './session-manager';
import { CircularBuffer } from '../utils/circular-buffer';

const log = logger.createLogger('mylife:home:studio:services:git');

export class Git implements Service {
  constructor(params: BuildParams) {
  }

  async init() {
  }

  async terminate() {
  }

  notifyFileUpdate() {
  }
}