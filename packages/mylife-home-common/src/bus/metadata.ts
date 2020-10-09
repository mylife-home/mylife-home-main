import { EventEmitter } from 'events';
import { Client } from './client';
import { TransportOptions } from './transport';
import * as encoding from './encoding';

const DOMAIN = 'metadata';

export interface RemoteMetadataView extends EventEmitter {
  on(event: 'set', cb: (path: string, value: any) => void): this;
  once(event: 'set', cb: (path: string, value: any) => void): this;

  on(event: 'clear', cb: (path: string) => void): this;
  once(event: 'clear', cb: (path: string) => void): this;

  readonly remoteInstanceName: string;

  readonly paths: Set<string>;
  getValue(path: string): any;
  findValue(path: string): any;
}

class RemoteMetadataViewImpl extends EventEmitter implements RemoteMetadataView {
  private readonly registry = new Map<string, any>();

  constructor(private readonly client: Client, readonly remoteInstanceName: string) {
    super();
  }

  private get listenTopic() {
    return this.client.buildRemoteTopic(this.remoteInstanceName, DOMAIN, '#');
  }

  async init() {
    this.client.on('message', this.onMessage);
    await this.client.subscribe(this.listenTopic);
  }

  async terminate() {
    await this.client.unsubscribe(this.listenTopic);
    this.client.off('message', this.onMessage);
  }

  private readonly onMessage = (topic: string, payload: Buffer) => {
    const [instanceName, domain, ...parts] = topic.split('/');
    if (instanceName !== this.remoteInstanceName || domain !== DOMAIN) {
      return;
    }
    
    const path = parts.join('/');

    if(!payload.length) {
      this.registry.delete(path);
      this.emit('clear', path);
      return;
    }

    const value = encoding.readJson(payload);
    this.registry.set(path, value);
    this.emit('set', path, value);
  }

  get paths() {
    return new Set(this.registry.keys());
  }

  getValue(path: string) {
    const value = this.findValue(path);
    if (!value) {
      throw new Error(`Unknown path '${path}'`);
    }
    return value;
  }

  findValue(path: string) {
    return this.registry.get(path);
  }
}

export class Metadata {
  private readonly views = new Set<RemoteMetadataViewImpl>();

  constructor(private readonly client: Client, options: TransportOptions) {
  }

  async set(path: string, value: any): Promise<void> {
    const topic = this.client.buildTopic(DOMAIN, path);
    await this.client.publish(topic, encoding.writeJson(value), true);
  }

  async clear(path: string): Promise<void> {
    const topic = this.client.buildTopic(DOMAIN, path);
    await this.client.publish(topic, Buffer.allocUnsafe(0), true);
  }

  async createView(remoteInstanceName: string): Promise<RemoteMetadataView> {
    const view = new RemoteMetadataViewImpl(this.client, remoteInstanceName);
    this.views.add(view);
    await view.init();
    return view;
  }

  async closeView(view: RemoteMetadataView) {
    const viewImpl = view as RemoteMetadataViewImpl;
    this.views.delete(viewImpl);
    await viewImpl.terminate();
  }
}