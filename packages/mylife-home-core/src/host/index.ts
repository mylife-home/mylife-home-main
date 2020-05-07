import { EventEmitter } from 'events';
import { ComponentDescriptor, ActionDescriptor, StateDescriptor, ConfigType, Type } from '../metadata';

interface Component {
  destroy?: () => void;
}

export declare interface Host extends EventEmitter {
  on(event: 'state', listener: (name: string, value: any) => void): this;
  off(event: 'state', listener: (name: string, value: any) => void): this;
  once(event: 'state', listener: (name: string, value: any) => void): this;
}

export class Host extends EventEmitter {
  private readonly component: Component;
  private readonly actions = new Map<string, Action>();
  private readonly states = new Map<string, State>();
  private destroyed = false;

  constructor(private readonly id: string, private readonly descriptor: ComponentDescriptor, config: any) {
    super();

    this.validateConfiguration(config);

    const ComponentType = this.descriptor.componentType;
    this.component = new ComponentType(config);

    for (const descriptor of this.descriptor.actions.values()) {
      this.actions.set(descriptor.name, new Action(this.component, descriptor));
    }

    for (const descriptor of this.descriptor.states.values()) {
      const { name } = descriptor;
      const listener = (value: any) => {
        if (!this.destroyed) {
          this.emit('state', name, value);
        }
      };

      this.states.set(name, new State(this.component, descriptor, listener));
    }
  }

  private validateConfiguration(config: any) {
    for (const [key, desc] of this.descriptor.configs.entries()) {
      try {
        const value = config[key];
        validateConfigurationItem(value, desc.type);
      } catch (err) {
        err.message = `Invalid configuration for component '${this.id}' of type '${this.descriptor.name} for configuration entry ${key}: ${err.message}`;
        throw err;
      }
    }
  }

  destroy() {
    this.destroyed = true;
    if(this.component.destroy) {
      this.component.destroy();
    }
  }

  private checkDestroyed() {
    if (this.destroyed) {
      throw new Error(`Cannot use destroyed component '${this.id}'`);
    }
  }

  executeAction(name: string, value: any) {
    this.checkDestroyed();

    const action = this.actions.get(name);
    if (!action) {
      throw new Error(`No such action: '${name}' on component '${this.id}' of type '${this.descriptor.name}`);
    }

    action.execute(value);
  }

  getState(name: string) {
    this.checkDestroyed();

    const state = this.states.get(name);
    if (!state) {
      throw new Error(`No such state: '${name}' on component '${this.id}' of type '${this.descriptor.name}`);
    }

    return state.value;
  }

  getStates() {
    this.checkDestroyed();

    const result: any = {};
    for (const [key, state] of this.states.entries()) {
      result[key] = state.value;
    }
    return result;
  }
}

class Action {
  private readonly target: (value: any) => void;
  private readonly type: Type;

  constructor(component: Component, descriptor: ActionDescriptor) {
    this.type = descriptor.type;
    const { name } = descriptor;
    this.target = (value: any) => {
      (component as any)[name](value);
    };
  }

  execute(value: any) {
    validateValue(value, this.type);
    this.target(value);
  }
}

class State extends EventEmitter {
  private _value: any;
  private readonly type: Type;

  constructor(component: Component, descriptor: StateDescriptor, listener: (value: any) => void) {
    super();

    this.type = descriptor.type;
    const { name } = descriptor;
    this._value = (component as any)[name];
    validateValue(this._value, this.type);

    // override component value with property
    Object.defineProperty(component, name, {
      get: () => {
        return this._value;
      },

      set: (newValue: any) => {
        validateValue(newValue, this.type);
        if (newValue === this._value) {
          return;
        }

        this._value = newValue;
        listener(newValue);
      }
    });
  }

  get value() {
    return this._value;
  }
}

function validateValue(value: any, expectedType: Type) {
  if(value === null) {
    throw new Error('Got null value');
  }
  expectedType.validate(value);
}

function validateConfigurationItem(value: any, expectedType: ConfigType) {
  if (value == null) {
    throw new Error('missing configuration entry');
  }

  const type = typeof value;

  switch (expectedType) {
    case ConfigType.STRING:
      if (type !== 'string') {
        throw new Error(`expected type 'string' but got '${type}'`);
      }
      break;

    case ConfigType.BOOL:
      if (type !== 'boolean') {
        throw new Error(`expected type 'boolean' but got '${type}'`);
      }
      break;

    case ConfigType.INTEGER:
      if (type !== 'number') {
        throw new Error(`expected type 'boolean' but got '${type}'`);
      }
      if (value % 1 !== 0) {
        throw new Error(`expected type 'integer' but the provided value '${value}' has decimal part`);
      }
      break;

    case ConfigType.FLOAT:
      if (type !== 'number') {
        throw new Error(`expected type 'boolean' but got '${type}'`);
      }
      break;

    default:
      throw new Error(`Unsupported config type: '${expectedType}`);
  }
}
