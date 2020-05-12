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

export class Store {
  private readonly components = new Map<string, ComponentConfig>();
  private readonly bindings = new Map<string, BindingConfig>();
  private dirty = false;

  async init() {
    // TODO
  }

  async close() {
    // TODO: clear scheduled sync (if needed)
    if (this.dirty) {
      await this.sync();
    }
  }

  async sync() {
    // TODO
    this.dirty = false;
  }

  private change() {
    this.dirty = true;
    // TODO: schedule sync
  }

  setComponent(config: ComponentConfig) {
    this.components.set(config.id, config);
    this.change();
  }

  removeComponent(id: string) {
    this.components.delete(id);
    this.change();
  }

  addBinding(config: BindingConfig) {
    const key = this.buildBindingKey(config);
    this.bindings.set(key, config);
    this.change();
  }

  removeBinding(config: BindingConfig) {
    const key = this.buildBindingKey(config);
    this.bindings.delete(key);
    this.change();
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