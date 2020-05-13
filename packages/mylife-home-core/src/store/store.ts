import { logger } from 'mylife-home-common';
import { StoreOperations, StoreItemType, StoreItem } from './common';

const log = logger.createLogger('mylife:home:core:store');

export interface ComponentConfig {
  readonly id: string;
  readonly plugin: string;
  readonly config: { [name: string]: any; };
}

export interface BindingConfig {
  readonly sourceId: string;
  readonly sourceState: string;
  readonly targetId: string;
  readonly targetAction: string;
}

export interface StoreOptions {
  readonly operations: string;
  readonly operationsConfig?: any;
}

export class Store {
  private readonly components = new Map<string, ComponentConfig>();
  private readonly bindings = new Map<string, BindingConfig>();

  constructor(private readonly operations: StoreOperations) {
  }

  async load() {
    const items = await this.operations.load();
    for (const item of items) {
      switch (item.type) {
        case StoreItemType.COMPONENT: {
          const config = item.config as ComponentConfig;
          this.components.set(config.id, config);
          break;
        }

        case StoreItemType.BINDING: {
          const config = item.config as BindingConfig;
          const key = this.buildBindingKey(config);
          this.bindings.set(key, config);
          break;
        }

        default:
          throw new Error(`Unknown item type '${item.type}'`);
      }
    }

    log.info(`${items.length} items loaded`);
  }

  async save() {
    const items: StoreItem[] = [];

    for (const config of this.components.values()) {
      items.push({ type: StoreItemType.COMPONENT, config });
    }

    for (const config of this.bindings.values()) {
      items.push({ type: StoreItemType.BINDING, config });
    }

    await this.operations.save(items);

    log.info(`${items.length} items saved`);
  };

  setComponent(config: ComponentConfig) {
    this.components.set(config.id, config);
  }

  removeComponent(id: string) {
    this.components.delete(id);
  }

  addBinding(config: BindingConfig) {
    const key = this.buildBindingKey(config);
    this.bindings.set(key, config);
  }

  removeBinding(config: BindingConfig) {
    const key = this.buildBindingKey(config);
    this.bindings.delete(key);
  }

  private buildBindingKey(config: BindingConfig) {
    return [config.sourceId, config.sourceState, config.targetId, config.targetAction].join('|');
  }

  getComponents() {
    return new Set(this.components.values());
  }

  getBindings() {
    return new Set(this.bindings.values());
  }
}