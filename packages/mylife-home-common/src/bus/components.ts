import { Client } from './client';

const DOMAIN: string = 'components';

class Component {
  private readonly actions = new Map<string, (value: Buffer) => void>();

  constructor(private readonly client: Client, private readonly id: string) {
    this.client.on('message', (topic: string, payload: Buffer) => this.onMessage(topic, payload));
  }

  async terminate() {
    const topics = Array.from(this.actions.keys());
    if(topics.length) {
      await this.client.unsubscribe(topics);
    }
  }

  async addAction(name: string, impl: (value: Buffer) => void) {
    const topic = this.client.buildTopic(DOMAIN, this.id, name);
    this.actions.set(topic, impl);
    await this.client.subscribe(topic);
  }

  async setState(name: string, value: Buffer) {
    await this.client.publish(this.client.buildTopic(DOMAIN, this.id, name), value);
  }

  private onMessage(topic: string, data: Buffer): void {
    const action = this.actions.get(topic);
    if(action) {
      action(data);
    }
  }
}

export class Components {
  private readonly components: Map<string, Component> = new Map<string, Component>();

  constructor(private readonly client: Client) {
  }

  addComponent(id: string) {
    const existing = this.components.get(id);
    if (existing) {
      throw new Error(`Service with id '${id}' does already exist`);
    }

    const component = new Component(this.client, id);
    this.components.set(id, component);
  }

  async removeCompondent(id: string) {
    const service = this.components.get(id);
    if (!service) {
      throw new Error(`Service with id '${id}' does not exist`);
    }

    await service.terminate();
    this.components.delete(id);
  }

  async addAction(componentId: string, name: string, impl: (value: Buffer) => void) {

  }

  async setState(componentId: string, name: string, value: Buffer) {

  }
}
