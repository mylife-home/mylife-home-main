import 'reflect-metadata';
import { components } from 'mylife-home-common';
import { StateOptions, ActionOptions, ComponentOptions, ConfigOptions } from './decorators';

import metadata = components.metadata;
import { Metadata } from 'mylife-home-common/dist/bus';

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
  readonly type: metadata.Type;

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
  readonly type: metadata.Type;

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

function validateType(primitive: Primitive, providedType?: metadata.Type) {
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
  readonly type: metadata.ConfigType;

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
  readonly usage: metadata.PluginUsage;

  constructor(readonly componentType: ComponentType, options: ComponentOptions, actions: Map<string, ActionOptions>, states: Map<string, StateOptions>, configs: Set<ConfigOptions>) {
    this.name = options.name || formatClassName(componentType.name);
    this.description = options.description;
    this.usage = options.usage;
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

  getMetadata(): metadata.Plugin {
    const members: { [name: string]: metadata.Member; } = {};
    for (const descriptor of this.actions.values()) {
      members[descriptor.name] = { memberType: metadata.MemberType.ACTION, description: descriptor.description, valueType: descriptor.type };
    }
    for (const descriptor of this.states.values()) {
      members[descriptor.name] = { memberType: metadata.MemberType.STATE, description: descriptor.description, valueType: descriptor.type };
    }

    const config: { [name: string]: metadata.ConfigItem; } = {};
    for (const descriptor of this.configs.values()) {
      config[descriptor.name] = { description: descriptor.description, valueType: descriptor.type };
    }

    // TODO
    const module = 'module-TODO';
    const version = '1.0.0-TODO';

    const id = `${module}.${name}`;
    return { id, module, name: this.name, usage: this.usage, version, description: this.description, members, config };
  }
}

function formatClassName(name: string) {
  // https://gist.github.com/thevangelist/8ff91bac947018c9f3bfaad6487fa149
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

// FIXME
function getPrimitive(type: metadata.Type): string {
  switch (type.primitive) {
    case metadata.Primitives.STRING:
      return 'String';
    case metadata.Primitives.BOOL:
      return 'Boolean';
    case metadata.Primitives.UINT8:
    case metadata.Primitives.INT8:
    case metadata.Primitives.UINT32:
    case metadata.Primitives.INT32:
    case metadata.Primitives.FLOAT:
      return 'Number';
    case metadata.Primitives.JSON:
      return 'Object';
    default:
      throw new Error(`Unsupported type '${type}'`);
  }
}

function getDefaultType(primitive: string): metadata.Type {
  switch (primitive) {
    case 'String':
      return new metadata.Text();
    case 'Boolean':
      return new metadata.Bool();
    case 'Number':
      return new metadata.Float();
    case 'Object':
      return new metadata.Complex();
    default:
      throw new Error(`Unsupported primitive '${primitive}'`);
  }
}