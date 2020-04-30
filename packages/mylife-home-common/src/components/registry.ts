import { EventEmitter } from 'events';
import { ComponentDescriptor } from './metadata';

// should have a state of remote components from bus
// home-core should be able to add its local components

// should have actions, states, and metadata of each component

export interface Component extends EventEmitter {
  on(event: 'state', listener: (name: string, value: any) => void): this;
  off(event: 'state', listener: (name: string, value: any) => void): this;
  once(event: 'state', listener: (name: string, value: any) => void): this;

  readonly instanceName: string; // or null for local
  readonly id: string;
  readonly descriptor: ComponentDescriptor;

  executeAction(name: string, value: any): void;
  getState(name: string): any;
  getStates(): { [name: string]: any; };
}

export interface Registry extends EventEmitter {
  on(event: 'add', listener: (component: Component) => void): this;
  off(event: 'add', listener: (component: Component) => void): this;
  once(event: 'add', listener: (component: Component) => void): this;

  on(event: 'remove', listener: (component: Component) => void): this;
  off(event: 'remove', listener: (component: Component) => void): this;
  once(event: 'remove', listener: (component: Component) => void): this;
}

export class Registry extends EventEmitter implements Registry {
  private readonly store = new Set<Component>();

  addComponent(component: Component) {
    if (this.store.has(component)) {
      throw new Error(`Component ${component.instanceName}:${component.id} does already exist in the store`);
    }
    this.store.add(component);
    this.emit('add', component);
  }

  removeComponent(component: Component) {
    if (!this.store.has(component)) {
      throw new Error(`Component ${component.instanceName}:${component.id} does not exist in the store`);
    }
    this.store.delete(component);
    this.emit('remove', component);
  }
}

class BusComponentsPublisher {

}