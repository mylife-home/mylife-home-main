import { logger, tools } from 'mylife-home-common';
import { StoreOperations, StoreConfiguration } from './common';
import { StoreItemType, StoreItem, ComponentConfig, BindingConfig } from './model';

import { MemoryStoreOperations } from './operations/memory';
import { MountedFsStoreOperations } from './operations/mounted-fs';
import { FsStoreOperations } from './operations/fs';

const log = logger.createLogger('mylife:home:core:store');

interface StoreOperationsType extends Function {
  new (configuration: StoreConfiguration): StoreOperations;
}

const operationTypes: { [type: string]: StoreOperationsType } = {
  memory: MemoryStoreOperations,
  'mounted-fs': MountedFsStoreOperations,
  fs: FsStoreOperations,
};

export class Store {
  private readonly operations: StoreOperations;
  private readonly components = new Map<string, ComponentConfig>();
  private readonly bindings = new Map<string, BindingConfig>();

  constructor() {
    const configuration = tools.getConfigItem<StoreConfiguration>('store');
    
    const OperationsType = operationTypes[configuration.type];
    if (!OperationsType) {
      throw new Error(`Invalid store operations type: '${configuration.type}'`);
    }

    this.operations = new OperationsType(configuration);
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
  }

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
    return [config.sourceComponent, config.sourceState, config.targetComponent, config.targetAction].join('|');
  }

  getComponents() {
    return new Set(this.components.values());
  }

  getBindings() {
    return new Set(this.bindings.values());
  }

  hasBindings() {
    return this.bindings.size > 0;
  }
}
