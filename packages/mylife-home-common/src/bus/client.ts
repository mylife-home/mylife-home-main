import { EventEmitter } from 'events';
import * as mqtt from 'async-mqtt';
import * as encoding from './encoding';
import { fireAsync, Deferred } from '../tools';
import * as logger from '../logger';

const log = logger.createLogger('mylife:home:common:bus:client');

export declare interface Client {
  on(event: 'onlineChange', cb: (online: boolean) => void): this;
  once(event: 'onlineChange', cb: (online: boolean) => void): this;

  on(event: 'message', cb: (topic: string, payload: Buffer) => void): this;
  once(event: 'message', cb: (topic: string, payload: Buffer) => void): this;
}

export class Client extends EventEmitter {
  private readonly client: mqtt.AsyncClient;
  private _online: boolean = false;
  private readonly subscriptions = new Set<string>();

  constructor(public readonly instanceName: string, serverUrl: string, private readonly residentStateDelay: number = 1000) {
    super();
    this.setMaxListeners(Infinity); // Many components or rpc can listen for updates here

    const qos: mqtt.QoS = 0;
    const will = { topic: this.buildTopic('online'), payload: Buffer.allocUnsafe(0), retain: true, qos };
    this.client = mqtt.connect(serverUrl, { will, resubscribe: false, clientId: instanceName });

    this.client.on('connect', () =>
      fireAsync(async () => {
        // given the spec, it is unclear if LWT should be executed in case of client takeover, so we run it to be sure
        await this.clearRetain(this.buildTopic('online'));

        await this.clearResidentState();
        await this.publish(this.buildTopic('online'), encoding.writeBool(true), true);
        this.onlineChange(true);

        if (this.subscriptions.size) {
          await this.client.subscribe(Array.from(this.subscriptions));
        }
      })
    );

    this.client.on('close', () => this.onlineChange(false));

    this.client.on('error', (err) => {
      log.error(err, 'mqtt error');
    });

    this.client.on('message', (topic, payload) => this.emit('message', topic, payload));
  }

  private async clearResidentState() {
    // register on self state, and remove on every message received
    // wait 1 sec after last message receive
    const { promise: sleepPromise, reset: resetSleep } = sleepWithReset(this.residentStateDelay);

    const clearTopic = (topic: string, payload: Buffer, packet: mqtt.IPublishPacket) => {
      // only clear real retained messages
      if (packet.retain && payload.length > 0 && topic.startsWith(this.instanceName + '/')) {
        resetSleep();
        fireAsync(() => this.clearRetain(topic));
      }
    };
    
    const selfStateTopic = this.buildTopic('#');
    this.client.on('message', clearTopic);
    await this.subscribe(selfStateTopic);

    await sleepPromise;

    this.client.off('message', clearTopic);
    await this.unsubscribe(selfStateTopic);
  }

  private onlineChange(value: boolean): void {
    if (value === this._online) {
      return;
    }
    this._online = value;
    log.info(`online: ${value}`);
    this.emit('onlineChange', value);
  }

  get online(): boolean {
    return this._online;
  }

  async terminate(): Promise<void> {
    if (this.client.connected) {
      await this.clearRetain(this.buildTopic('online'));
      await this.clearResidentState();
    }
    await this.client.end(true);
  }

  public buildTopic(domain: string, ...args: string[]): string {
    const finalArgs = [this.instanceName, domain, ...args];
    return finalArgs.join('/');
  }

  public buildRemoteTopic(targetInstance: string, domain: string, ...args: string[]): string {
    const finalArgs = [targetInstance, domain, ...args];
    return finalArgs.join('/');
  }

  async publish(topic: string, payload: Buffer, retain: boolean = false) {
    await this.client.publish(topic, payload, { retain });
  }

  private async clearRetain(topic: string) {
    await this.publish(topic, Buffer.allocUnsafe(0), true);
  }

  async subscribe(topic: string | string[]) {
    if (!Array.isArray(topic)) {
      topic = [topic];
    }
    for (const item of topic) {
      this.subscriptions.add(item);
    }
    if (this.online) {
      await this.client.subscribe(topic);
    }
  }

  async unsubscribe(topic: string | string[]) {
    if (!Array.isArray(topic)) {
      topic = [topic];
    }
    for (const item of topic) {
      this.subscriptions.delete(item);
    }
    if (this.online) {
      await this.client.unsubscribe(topic);
    }
  }
}

function sleepWithReset(delay: number) {
  const deferred = new Deferred<void>();
  let timeoutHandle: NodeJS.Timeout;

  const reset = () => {
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(() => deferred.resolve(), delay);
  };

  reset();

  return { promise: deferred.promise, reset };
}