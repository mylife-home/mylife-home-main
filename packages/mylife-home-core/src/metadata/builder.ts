import { ActionOptions, StateOptions, ComponentOptions, ConfigOptions } from './decorators';
import { ComponentDescriptor } from './descriptors';
import { components } from 'mylife-home-common';

import Registry = components.Registry;
import Plugin = components.metadata.Plugin;

export interface ComponentType extends Function {
  new (...args: any[]): any;
}

export interface LocalPlugin extends Plugin {
  readonly componentType: ComponentType;
}

class DescriptorBuilder {
  private options: ComponentOptions;
  private readonly configs = new Set<ConfigOptions>();
  private readonly actions = new Map<string, ActionOptions>();
  private readonly states = new Map<string, StateOptions>();

  constructor(private readonly type: ComponentType) {}

  addComponent(options: ComponentOptions) {
    this.options = options;
  }

  addConfig(options: ConfigOptions) {
    this.configs.add(options);
  }

  addAction(name: string, options: ActionOptions) {
    this.actions.set(name, options);
  }

  addState(name: string, options: StateOptions) {
    this.states.set(name, options);
  }

  build(module: string, version: string, registry: Registry) {
    if (!this.options) {
      throw new Error(`Class '${this.type.name}' looks like component but @component decorator is missing`);
    }

    const descriptor = new ComponentDescriptor(this.type, this.options, this.actions, this.states, this.configs);
    const plugin = descriptor.getMetadata();
    const finalPlugin: LocalPlugin = { ...plugin, module, version, componentType: this.type };
    registry.addPlugin(null, finalPlugin);
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
    builder.build(context.module, context.version, context.registry);
  }
 
}

export function terminate() {
  if (!context) {
    throw new Error('Cannot terminate context with no context');
  }

  context = null;
}
