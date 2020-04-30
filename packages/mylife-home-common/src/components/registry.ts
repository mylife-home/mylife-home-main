import { EventEmitter } from 'events';
import { ComponentDescriptor } from './metadata';

// should have a state of remote components from bus
// home-core should be able to add its local components

// should have actions, states, and metadata of each component

export interface Component extends EventEmitter {
  on(event: 'state', listener: (name: string, value: any) => void): this;
  off(event: 'state', listener: (name: string, value: any) => void): this;
  once(event: 'state', listener: (name: string, value: any) => void): this;

  readonly id: string;
  readonly descriptor: ComponentDescriptor;

  executeAction(name: string, value: any): void;
  getState(name: string): any;
  getStates(): { [name: string]: any; };
}

export class Registry {
  constructor() {

  }

  addComponent(component: Component) {

  }
}

class BusComponentsPublisher {

}