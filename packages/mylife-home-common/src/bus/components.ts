import { Client } from './client';
import { TransportOptions } from './transport';

const DOMAIN: string = 'components';

export interface LocalComponent {
  addAction(name: string, impl: (value: Buffer) => void): Promise<void>;
  setState(name: string, value: Buffer): Promise<void>;
}

class LocalComponentImpl implements LocalComponent {
  private readonly actions = new Map<string, (value: Buffer) => void>();

  constructor(private readonly client: Client, private readonly id: string) {
    this.client.on('message', (topic: string, payload: Buffer) => this.onMessage(topic, payload));
  }

  async terminate() {
    const topics = Array.from(this.actions.keys());
    if (topics.length) {
      await this.client.unsubscribe(topics);
    }
  }

  async addAction(name: string, impl: (value: Buffer) => void) {
    const topic = this.client.buildTopic(DOMAIN, this.id, name);
    if (this.actions.get(topic)) {
      throw new Error(`Action '${name}' does already exist on component '${this.id}'`);
    }

    this.actions.set(topic, impl);
    await this.client.subscribe(topic);
  }

  async setState(name: string, value: Buffer) {
    await this.client.publish(this.client.buildTopic(DOMAIN, this.id, name), value);
  }

  private onMessage(topic: string, data: Buffer): void {
    const action = this.actions.get(topic);
    if (action) {
      action(data);
    }
  }
}

export class Components {
  private readonly components: Map<string, LocalComponentImpl> = new Map<string, LocalComponentImpl>();

  constructor(private readonly client: Client, options: TransportOptions) {
  }

  addLocalComponent(id: string): LocalComponent {
    const existing = this.components.get(id);
    if (existing) {
      throw new Error(`Component with id '${id}' does already exist`);
    }

    const component = new LocalComponentImpl(this.client, id);
    this.components.set(id, component);
    return component;
  }

  getLocalComponent(id: string): LocalComponent {
    const component = this.components.get(id);
    if (!component) {
      throw new Error(`Component with id '${id}' does not exist`);
    }
    return component;
  }

  async removeLocalComponent(id: string) {
    const component = this.getLocalComponent(id) as LocalComponentImpl;

    await component.terminate();
    this.components.delete(id);
  }
}
