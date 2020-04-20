import { EventEmitter } from 'events';
import { ComponentDescriptor, ActionDescriptor, StateDescriptor, ConfigType, NetType } from '../metadata';

interface Component {
  destroy?: () => void;
}

export declare interface Host {
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

    const Type = this.descriptor.componentType;
    this.component = new Type(config);

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
  private readonly validator: (value: any) => void;

  constructor(component: Component, descriptor: ActionDescriptor) {
    this.validator = createNetTypeValidator(descriptor.type);
    const { name } = descriptor;
    this.target = (value: any) => {
      (component as any)[name](value);
    };
  }

  execute(value: any) {
    this.validator(value);
    this.target(value);
  }
}

class State extends EventEmitter {
  private _value: any;

  constructor(component: Component, descriptor: StateDescriptor, listener: (value: any) => void) {
    super();

    const { name } = descriptor;
    const validator = createNetTypeValidator(descriptor.type);
    this._value = (component as any)[name];
    validator(this._value);

    // override component value with property
    Object.defineProperty(component, name, {
      get: () => {
        return this._value;
      },

      set: (newValue: any) => {
        validator(newValue);
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

const UINT32_MAX = 0xFFFFFFFF;
const INT32_MIN = - 0x80000000;
const INT32_MAX = 0x7FFFFFFF;

function createNetTypeValidator(type: NetType) {
  const basicValidator = (expectedType: string) => (value: any) => {
    if (value == null) {
      throw new Error('got null value');
    }
    const valueType = typeof value;
    if (valueType !== expectedType) {
      throw new Error(`expected value of type '${expectedType}' but got '${valueType}'`);
    }
  };

  const integerValidator = (min: number, max: number) => (value: any) => {
    if (value == null) {
      throw new Error('got null value');
    }
    const valueType = typeof value;
    if (valueType !== 'number') {
      throw new Error(`expected value of type 'number' but got '${valueType}'`);
    }
    if (value % 1 !== 0) {
      throw new Error(`expected integer value but got '${value}' which has decimal part`);
    }

    if (value < min) {
      throw new Error(`expected value >= ${min} but got ${value}`);
    }
    if (value > max) {
      throw new Error(`expected value <= ${max} but got ${value}`);
    }
  };

  switch (type) {
    case NetType.STRING:
      return basicValidator('string');
    case NetType.BOOL:
      return basicValidator('boolean');
    case NetType.FLOAT:
      return basicValidator('number');
    case NetType.UINT8:
      return integerValidator(0, 255);
    case NetType.INT8:
      return integerValidator(-128, 127);
    case NetType.UINT32:
      return integerValidator(0, UINT32_MAX);
    case NetType.INT32:
      return integerValidator(INT32_MIN, INT32_MAX);
    default:
      throw new Error(`Unsupported net type: '${type}`);
  }
}
