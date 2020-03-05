import { Client } from './client';
import { TransportOptions } from './transport';

const DOMAIN: string = 'localComponents';

export interface LocalComponent {
  registerAction(name: string, impl: (value: Buffer) => void): Promise<void>;
  setState(name: string, value: Buffer): Promise<void>;
}

export interface RemoteComponent {
  emitAction(name: string, value: Buffer): Promise<void>;
  registerStateChange(name: string, handler: (value: Buffer) => void): Promise<void>;
}

class ComponentBase {
  private readonly subscriptions = new Map<string, (value: Buffer) => void>();
  
  constructor(protected readonly client: Client) {
    this.client.on('message', (topic: string, payload: Buffer) => this.onMessage(topic, payload));
  }

  async addSubscription(topic: string, handler: (value: Buffer) => void) {
    if (this.subscriptions.get(topic)) {
      return false;
    }

    this.subscriptions.set(topic, handler);
    await this.client.subscribe(topic);
    return true;
  }

  private onMessage(topic: string, data: Buffer): void {
    const handler = this.subscriptions.get(topic);
    if (handler) {
      handler(data);
    }
  }

  async terminate() {
    const topics = Array.from(this.subscriptions.keys());
    if (topics.length) {
      await this.client.unsubscribe(topics);
    }
  }
}

class LocalComponentImpl extends ComponentBase implements LocalComponent {
  constructor(client: Client, private readonly id: string) {
    super(client);
  }

  async registerAction(name: string, impl: (value: Buffer) => void) {
    const topic = this.client.buildTopic(DOMAIN, this.id, name);
    if(!await this.addSubscription(topic, impl)) {
      throw new Error(`Action '${name}' does already exist on component '${this.id}'`);
    }
  }

  async setState(name: string, value: Buffer) {
    const topic = this.client.buildTopic(DOMAIN, this.id, name);
    await this.client.publish(topic, value);
  }
}

class RemoteComponentImpl extends ComponentBase implements RemoteComponent {
  constructor(client: Client, private readonly remoteInstanceName: string, private readonly id: string) {
    super(client);
  }

  async emitAction(name: string, value: Buffer) {
    const topic = this.client.buildRemoteTopic(this.remoteInstanceName, DOMAIN, this.id, name);
    await this.client.publish(topic, value);
  }

  async registerStateChange(name: string, handler: (value: Buffer) => void) {
    const topic = this.client.buildRemoteTopic(this.remoteInstanceName, DOMAIN, this.id, name);
    if(!await this.addSubscription(topic, handler)) {
      throw new Error(`State '${name}' already registered for changes on component '${this.id}'`);
    }
  }
}

export class Components {
  private readonly localComponents = new Map<string, LocalComponentImpl>();
  private readonly remoteComponents = new Set<RemoteComponentImpl>();

  constructor(private readonly client: Client, options: TransportOptions) {
  }

  addLocalComponent(id: string): LocalComponent {
    const existing = this.localComponents.get(id);
    if (existing) {
      throw new Error(`Component with id '${id}' does already exist`);
    }

    const component = new LocalComponentImpl(this.client, id);
    this.localComponents.set(id, component);
    return component;
  }

  getLocalComponent(id: string): LocalComponent {
    const component = this.localComponents.get(id);
    if (!component) {
      throw new Error(`Component with id '${id}' does not exist`);
    }
    return component;
  }

  async removeLocalComponent(id: string) {
    const component = this.getLocalComponent(id) as LocalComponentImpl;

    await component.terminate();
    this.localComponents.delete(id);
  }

  trackRemoteComponent(remoteInstanceName: string, id: string): RemoteComponent {
    const component = new RemoteComponentImpl(this.client, remoteInstanceName, id);
    this.remoteComponents.add(component);
    return component;
  }

  async untrackRemoteComponent(remoteComponent: RemoteComponent) {
    const component = remoteComponent as RemoteComponentImpl;
    await component.terminate();
    this.remoteComponents.delete(component);
  }
  
}
