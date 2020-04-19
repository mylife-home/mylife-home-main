import 'reflect-metadata';
import { StateOptions, ActionOptions, ComponentOptions } from './decorators';
import { Type, getPrimitive, getDefaultType } from './types';

interface ComponentType extends Function {
  new (...args: any[]): any;
}

const descriptors = new Map<ComponentType, ComponentDescriptor>();

export function getDescriptors() {
  return new Set(descriptors.values());
}

type Primitive = {
  name: string;
};

export function getDescriptor(type: ComponentType) {
  const descriptor = descriptors.get(type);
  if (!descriptor) {
    throw new Error(`No descriptor for type '${type.name}'`);
  }
  return descriptor;
}

export class ActionDescriptor {
  public readonly type: Type;

  constructor(componentType: ComponentType, readonly name: string, options: ActionOptions) {
    const primitives: Primitive[] = Reflect.getMetadata('design:paramtypes', componentType.prototype, name);
    if (primitives.length !== 1) {
      throw new Error(`Bad action '${name}' on component '${componentType.name}': expected 1 parameter but got ${primitives.length}`);
    }

    try {
      this.type = validateType(primitives[0], options.type);
    } catch (err) {
      err.message = `Bad action '${name}' on component '${componentType.name}':  ${err.message}`;
      throw err;
    }
  }
}

export class StateDescriptor {
  public readonly type: Type;

  constructor(componentType: ComponentType, readonly name: string, options: StateOptions) {
    const primitive: Primitive = Reflect.getMetadata('design:type', componentType.prototype, name);

    try {
      this.type = validateType(primitive, options.type);
    } catch (err) {
      err.message = `Bad action '${name}' on component '${componentType.name}':  ${err.message}`;
      throw err;
    }
  }
}

function validateType(primitive: Primitive, providedType?: Type) {
  if (providedType) {
    const expectedPrimitive = getPrimitive(providedType);
    if (expectedPrimitive !== primitive.name) {
      throw new Error(`Expected primitive '${expectedPrimitive}' but got '${primitive.name}'`);
    }
    return providedType;
  }

  return getDefaultType(primitive.name);
}

export class ComponentDescriptor {
  readonly actions = new Map<string, ActionDescriptor>();
  readonly states = new Map<string, StateDescriptor>();
  readonly name: string;

  constructor(readonly componentType: ComponentType, options: ComponentOptions, actions: Map<string, ActionOptions>, states: Map<string, StateOptions>) {
    this.name = formatClassName(componentType.name);
    for (const [name, options] of actions.entries()) {
      const descriptor = new ActionDescriptor(componentType, name, options);
      this.actions.set(descriptor.name, descriptor);
    }
    Object.freeze(this.actions);

    for (const [name, options] of states.entries()) {
      const descriptor = new StateDescriptor(componentType, name, options);
      this.states.set(descriptor.name, descriptor);
    }
    Object.freeze(this.states);
  }

  toMetadata(): any {
    const members: any = {};
    for (const descriptor of this.actions.values()) {
      members[descriptor.name] = { member: 'action', type: descriptor.type };
    }
    for (const descriptor of this.states.values()) {
      members[descriptor.name] = { member: 'state', type: descriptor.type };
    }
    return { name: this.name, members };
  }
}

function formatClassName(name: string) {
  // https://gist.github.com/thevangelist/8ff91bac947018c9f3bfaad6487fa149
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

class DescriptorBuilder {
  private readonly actions = new Map<string, ActionOptions>();
  private readonly states = new Map<string, StateOptions>();

  constructor(private readonly type: ComponentType) {}

  private checkType(type: ComponentType, name: string, memberType: string) {
    if (type !== this.type) {
      throw new Error(`Wrong type while declaring ${memberType} '${name}' on '${type.name}'. Type '${this.type.name}' should miss the 'component' decorator.`);
    }
  }

  addAction(type: ComponentType, name: string, options: ActionOptions) {
    this.checkType(type, name, 'action');
    this.actions.set(name, options);
  }

  addState(type: ComponentType, name: string, options: StateOptions) {
    this.checkType(type, name, 'state');
    this.states.set(name, options);
  }

  build(type: ComponentType, options: ComponentOptions) {
    const descriptor = new ComponentDescriptor(type, options, this.actions, this.states);
    descriptors.set(type, descriptor);
  }
}

let currentBuilder: DescriptorBuilder;

function getBuilder(type: ComponentType) {
  if (!currentBuilder) {
    currentBuilder = new DescriptorBuilder(type);
  }

  return currentBuilder;
}

export function addAction(type: ComponentType, name: string, options: ActionOptions) {
  getBuilder(type).addAction(type, name, options);
}

export function addState(type: ComponentType, name: string, options: StateOptions) {
  getBuilder(type).addState(type, name, options);
}

export function addComponent(type: ComponentType, options: ComponentOptions) {
  getBuilder(type).build(type, options);
  currentBuilder = null;
}
