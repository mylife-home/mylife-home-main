import { tools } from 'mylife-home-common';
import { StoreOperations, StoreItemType, StoreItem } from './common';

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

class SyncManager {
  private timeout: NodeJS.Timeout = null;
  private dirty = false;

  constructor(private readonly delay: number, private readonly handler: () => Promise<void>) {
  }

  private clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  changed() {
    this.dirty = true;
    this.clearTimeout();
    this.timeout = setTimeout(() => tools.fireAsync(() => this.sync()), this.delay);
  }

  async sync() {
    this.clearTimeout();
    await this.handler();
    this.dirty = false;
  }

  async close() {
    this.clearTimeout();

    if (this.dirty) {
      await this.sync();
    }
  }
}

export class Store {
  private readonly components = new Map<string, ComponentConfig>();
  private readonly bindings = new Map<string, BindingConfig>();
  private readonly syncManager: SyncManager;

  constructor(private readonly operations: StoreOperations, delay: number) {
    this.syncManager = new SyncManager(delay, this.sync);
  }

  async init() {
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
  }

  async close() {
    await this.syncManager.close();
  }

  private readonly sync = async () => {
    const items: StoreItem[] = [];

    for (const config of this.components.values()) {
      items.push({ type: StoreItemType.COMPONENT, config });
    }

    for (const config of this.bindings.values()) {
      items.push({ type: StoreItemType.BINDING, config });
    }

    await this.operations.save(items);
  };

  setComponent(config: ComponentConfig) {
    this.components.set(config.id, config);
    this.syncManager.changed();
  }

  removeComponent(id: string) {
    this.components.delete(id);
    this.syncManager.changed();
  }

  addBinding(config: BindingConfig) {
    const key = this.buildBindingKey(config);
    this.bindings.set(key, config);
    this.syncManager.changed();
  }

  removeBinding(config: BindingConfig) {
    const key = this.buildBindingKey(config);
    this.bindings.delete(key);
    this.syncManager.changed();
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