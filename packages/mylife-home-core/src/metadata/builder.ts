import { ActionOptions, StateOptions, ComponentOptions, ConfigOptions } from './decorators';
import { components } from 'mylife-home-common';

import Registry = components.Registry;
import metadata = components.metadata;

export interface ComponentType extends Function {
  new (...args: any[]): any;
}

type Primitive = {
  name: string;
};

export interface LocalPlugin extends metadata.Plugin {
  readonly componentType: ComponentType;
}

class DescriptorBuilder {
  private name: string;
  private description: string;
  private usage: metadata.PluginUsage;
  private readonly members: { [name: string]: metadata.Member } = {};
  private readonly config: { [name: string]: metadata.ConfigItem } = {};

  constructor(private readonly componentType: ComponentType) {}

  addComponent(options: ComponentOptions) {
    this.name = options.name || this.formatClassName(this.componentType.name);
    this.description = options.description;
    this.usage = options.usage;
  }

  addConfig(options: ConfigOptions) {
    this.config[options.name] = { description: options.description, valueType: options.type };
  }

  addAction(name: string, options: ActionOptions) {
    const primitives: Primitive[] = Reflect.getMetadata('design:paramtypes', this.componentType.prototype, name);
    if (primitives.length !== 1) {
      throw new Error(`Bad action '${name}' on component '${this.componentType.name}': expected 1 parameter but got ${primitives.length}`);
    }

    let valueType: metadata.Type;
    try {
      valueType = this.validateType(primitives[0], options.type);
    } catch (err) {
      err.message = `Bad action '${name}' on component '${this.componentType.name}':  ${err.message}`;
      throw err;
    }

    this.members[name] = { memberType: metadata.MemberType.ACTION, description: options.description, valueType };
  }

  addState(name: string, options: StateOptions) {
    const primitive: Primitive = Reflect.getMetadata('design:type', this.componentType.prototype, name);

    let valueType: metadata.Type;
    try {
      valueType = this.validateType(primitive, options.type);
    } catch (err) {
      err.message = `Bad action '${name}' on component '${this.componentType.name}':  ${err.message}`;
      throw err;
    }

    this.members[name] = { memberType: metadata.MemberType.STATE, description: options.description, valueType };
  }

  private validateType(primitive: Primitive, providedType?: metadata.Type) {
    if (providedType) {
      const expectedPrimitive = this.getPrimitive(providedType);
      if (expectedPrimitive !== primitive.name) {
        throw new Error(`Expected primitive '${expectedPrimitive}' but got '${primitive.name}'`);
      }
      return providedType;
    }

    return this.getDefaultType(primitive.name);
  }

  private formatClassName(name: string) {
    // https://gist.github.com/thevangelist/8ff91bac947018c9f3bfaad6487fa149
    return name
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  private getPrimitive(type: metadata.Type): string {
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

  private getDefaultType(primitive: string): metadata.Type {
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

  build(module: string, version: string): LocalPlugin {
    if (!this.name) {
      throw new Error(`Class '${this.componentType.name}' looks like component but @component decorator is missing`);
    }

    return {
      componentType: this.componentType,

      id: `${module}.${this.name}`,
      name: this.name,
      module,
      usage: this.usage,
      version,
      description: this.description,
      members: this.members,
      config: this.config,
    };
  }
}

interface Context {
  readonly module: string;
  readonly version: string;
  readonly registry: Registry;
  readonly builders: Map<ComponentType, DescriptorBuilder>;
}

let context: Context;

function getBuilder(type: ComponentType) {
  if (!context) {
    throw new Error('Cannot publish component outside of loading context');
  }

  const existing = context.builders.get(type);
  if (existing) {
    return existing;
  }

  const builder = new DescriptorBuilder(type);
  context.builders.set(type, builder);
  return builder;
}

export function addComponent(type: ComponentType, options: ComponentOptions) {
  getBuilder(type).addComponent(options);
}

export function addConfig(type: ComponentType, options: ConfigOptions) {
  getBuilder(type).addConfig(options);
}

export function addAction(type: ComponentType, name: string, options: ActionOptions) {
  getBuilder(type).addAction(name, options);
}

export function addState(type: ComponentType, name: string, options: StateOptions) {
  getBuilder(type).addState(name, options);
}

export function init(module: string, version: string, registry: Registry) {
  if (context) {
    throw new Error('Cannot init context while another one in use');
  }

  const builders = new Map<ComponentType, DescriptorBuilder>();
  context = { module, version, registry, builders };
}

export function build() {
  if (!context) {
    throw new Error('Cannot build context with no context');
  }

  for (const builder of context.builders.values()) {
    const plugin = builder.build(context.module, context.version);
    context.registry.addPlugin(null, plugin);
  }
}

export function terminate() {
  if (!context) {
    throw new Error('Cannot terminate context with no context');
  }

  context = null;
}
