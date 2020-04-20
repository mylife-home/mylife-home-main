import { ActionOptions, StateOptions, ComponentOptions, ConfigOptions } from './decorators';
import { addDescriptor, clearDescriptors, ComponentDescriptor, ComponentType } from './descriptors';

class DescriptorBuilder {
  private options:ComponentOptions;
  private readonly configs = new Set<ConfigOptions>();
  private readonly actions = new Map<string, ActionOptions>();
  private readonly states = new Map<string, StateOptions>();

  constructor(public readonly type: ComponentType) { }

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

  build() {
    if(!this.options) {
      throw new Error(`Class '${this.type.name}' looks like component but @component decorator is missing`);
    }

    return new ComponentDescriptor(this.type, this.options, this.actions, this.states, this.configs);
  }
}

const builders = new Map<ComponentType, DescriptorBuilder>();

function getBuilder(type: ComponentType) {
  const existing = builders.get(type);
  if(existing) {
    return existing;
  }

  const builder = new DescriptorBuilder(type);
  builders.set(type, builder);
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

export function build() {
  clearDescriptors();
  for(const builder of builders.values()) {
    addDescriptor(builder.build());
  }
  builders.clear();
}