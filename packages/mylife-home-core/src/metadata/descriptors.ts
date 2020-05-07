import 'reflect-metadata';
import { components } from 'mylife-home-common';
import { StateOptions, ActionOptions, ComponentOptions, ConfigOptions } from './decorators';
import { getDefaultType, ConfigType } from './types';

import Type = components.metadata.Type;
import Plugin = components.metadata.Plugin;

export interface ComponentType extends Function {
  new(...args: any[]): any;
}

const descriptors = new Map<ComponentType, ComponentDescriptor>();

export function getDescriptors() {
  return new Set(descriptors.values());
}

export function clearDescriptors() {
  descriptors.clear();
}

export function addDescriptor(descriptor: ComponentDescriptor) {
  descriptors.set(descriptor.componentType, descriptor);
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
  readonly description: string;
  readonly type: Type;

  constructor(componentType: ComponentType, readonly name: string, options: ActionOptions) {
    this.description = options.description;
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
  readonly description: string;
  readonly type: Type;

  constructor(componentType: ComponentType, readonly name: string, options: StateOptions) {
    this.description = options.description;
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

export class ConfigDescriptor {
  readonly name: string;
  readonly description: string;
  readonly type: ConfigType;

  constructor(options: ConfigOptions) {
    this.name = options.name;
    this.description = options.description;
    this.type = options.type;
  }
}

export class ComponentDescriptor {
  readonly actions = new Map<string, ActionDescriptor>();
  readonly states = new Map<string, StateDescriptor>();
  readonly configs = new Map<string, ConfigDescriptor>();
  readonly name: string;
  readonly description: string;

  constructor(readonly componentType: ComponentType, options: ComponentOptions, actions: Map<string, ActionOptions>, states: Map<string, StateOptions>, configs: Set<ConfigOptions>) {
    this.name = options.name || formatClassName(componentType.name);
    this.description = options.description;
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

    for (const options of configs) {
      const descriptor = new ConfigDescriptor(options);
      this.configs.set(descriptor.name, descriptor);
    }
    Object.freeze(this.configs);
  }

  getMetadata(): Plugin {
    const members: any = {};
    for (const descriptor of this.actions.values()) {
      const meta = { member: 'action', type: descriptor.type };
      addDescription(meta, descriptor);
      members[descriptor.name] = meta;
    }
    for (const descriptor of this.states.values()) {
      const meta = { member: 'state', type: descriptor.type };
      addDescription(meta, descriptor);
      members[descriptor.name] = meta;
    }
    const config: any = {};
    for (const descriptor of this.configs.values()) {
      const meta = { type: descriptor.type };
      addDescription(meta, descriptor);
      config[descriptor.name] = meta;
    }
    const meta = { name: this.name, members, config };
    addDescription(meta, this);
    return meta;
  }
}

function addDescription(meta: any, descriptor: { readonly description: string }) {
  if(descriptor.description) {
    meta.description = descriptor.description;
  }
}

function formatClassName(name: string) {
  // https://gist.github.com/thevangelist/8ff91bac947018c9f3bfaad6487fa149
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}
