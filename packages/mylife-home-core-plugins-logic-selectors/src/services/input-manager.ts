import { logger } from 'mylife-home-common';

// adapted from mylife-home-ui/public/app/utils/input-manager.js

const log = logger.createLogger('mylife:home:core:plugins:logic-selectors:services:input-manager');

export default class InputManager {

  config: { [event: string]: () => void; } = {};
  private eventStack: string = '';
  private endWait: NodeJS.Timeout = null;
  private lastDown: number = null;

  executeEvents() {
    log.debug(`Execute events : '${this.eventStack}'`);

    const fn = this.config[this.eventStack];
    fn && fn();
  }

  down() {
    // no input end for now
    if (this.endWait) {
      clearTimeout(this.endWait);
      this.endWait = null;
    }

    this.lastDown = Date.now();
  }

  up() {
    // no input end for now
    if (this.endWait) {
      clearTimeout(this.endWait);
      this.endWait = null;
    }

    // if no down, tchao
    if (!this.lastDown) {
      this.eventStack = '';
      return;
    }

    // Prise en compte de l'event
    const downTs = this.lastDown;
    const upTs = new Date().getTime();
    this.lastDown = null;

    // Ajout de l'event
    if (upTs - downTs < 500) {
      this.eventStack += 's';
    } else {
      this.eventStack += 'l';
    }

    // Attente de la fin de saisie
    this.endWait = setTimeout(() => {
      this.executeEvents();

      this.eventStack = '';
      this.endWait = null;
    }, 300);
  }
}
