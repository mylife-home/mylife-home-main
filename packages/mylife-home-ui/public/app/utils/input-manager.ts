'use strict';

class InputManager {

  config: { [event: string]: () => void; } = {};
  private eventStack: string = '';
  private endWait: number = null;
  private lastDown: number = null;

  constructor() {
    this.lastDown = null;
  }

  executeEvents() {
    console.log(`InputManager: execute events : '${this.eventStack}'`); // eslint-disable-line no-console

    const fn = this.config[this.eventStack];
    fn && fn();
  }

  down() {
    // no input end for now
    if (this.endWait) {
      window.clearTimeout(this.endWait);
    }

    this.lastDown = Date.now();
  }

  up() {
    // no input end for now
    if (this.endWait) {
      window.clearTimeout(this.endWait);
    }

    // if no down, tchao
    if (!this.lastDown) {
      this.eventStack = '';
      return;
    }

    // Prise en compte de l'event
    const downTs = this.lastDown;
    const upTs = Date.now();
    this.lastDown = null;

    // Ajout de l'event
    if (upTs - downTs < 500) {
      this.eventStack += 's';
    } else {
      this.eventStack += 'l';
    }

    // Attente de la fin de saisie
    this.endWait = window.setTimeout(() => {
      this.executeEvents();

      this.eventStack = '';
      this.endWait = null;
    }, 300);
  }
}

export default InputManager;
