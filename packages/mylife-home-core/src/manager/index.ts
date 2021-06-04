import { bus, tools, instanceInfo } from 'mylife-home-common';
import { ComponentManager } from './component-manager';
import { BindingConfig, ComponentConfig } from '../store';

export class Manager {
  private readonly transport: bus.Transport;
  private readonly componentManager: ComponentManager;

  constructor() {
    const supportsBindings = tools.getConfigItem<boolean>('supportsBindings', true) || false;
    this.transport = new bus.Transport({ presenceTracking: supportsBindings });
    this.componentManager = new ComponentManager(this.transport);
  }

  async init() {
    await this.componentManager.init();

    await this.transport.rpc.serve('components.add', async ({ id, plugin, config }: ComponentConfig) => this.componentManager.addComponent(id, plugin, config));
    await this.transport.rpc.serve('components.remove', async ({ id }: { id: string; }) => this.componentManager.removeComponent(id));
    await this.transport.rpc.serve('components.list', async () => this.componentManager.getComponents());
    instanceInfo.addCapability('components-api');

    if (this.componentManager.supportsBindings) {
      await this.transport.rpc.serve('bindings.add', async (config: BindingConfig) => this.componentManager.addBinding(config));
      await this.transport.rpc.serve('bindings.remove', async (config: BindingConfig) => this.componentManager.removeBinding(config));
      await this.transport.rpc.serve('bindings.list', async () => this.componentManager.getBindings());
      instanceInfo.addCapability('bindings-api');
    }

    await this.transport.rpc.serve('store.save', async () => this.componentManager.save());
    instanceInfo.addCapability('store-api');
  }

  async terminate() {
    await this.transport.rpc.unserve('components.add');
    await this.transport.rpc.unserve('components.remove');
    await this.transport.rpc.unserve('components.list');

    if (this.componentManager.supportsBindings) {
      await this.transport.rpc.unserve('bindings.add');
      await this.transport.rpc.unserve('bindings.remove');
      await this.transport.rpc.unserve('bindings.list');
    }

    await this.transport.rpc.unserve('store.save');

    await this.componentManager.terminate();
    await this.transport.terminate();
  }
}
