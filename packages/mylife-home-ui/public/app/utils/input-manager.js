'use strict';

class InputManager {

  constructor() {
    this.config     = {};
    this.lastDown   = null;
    this.eventStack = '';
    this.endWait    = null;
  }

  executeEvents() {
    console.log(`InputManager: execute events : '${this.eventStack}'`); // eslint-disable-line no-console

    const fn = this.config[this.eventStack];
    fn && fn();
  }

  down(e) {
    e && e.preventDefault();

    // no input end for now
    if(this.endWait) {
      window.clearTimeout(this.endWait);
    }

    this.lastDown = {
      timestamp: new Date().getTime()
    };
  }

  up(e) {
    e && e.preventDefault();

    // no input end for now
    if(this.endWait) {
      window.clearTimeout(this.endWait);
    }

    // if no down, tchao
    if(!this.lastDown) {
      this.eventStack = '';
      return;
    }

    // Prise en compte de l'event
    const downTs = this.lastDown.timestamp;
    const upTs = new Date().getTime();
    this.lastDown = null;

    // Ajout de l'event
    if(upTs - downTs < 500) {
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
