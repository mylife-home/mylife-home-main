import { Client } from './client';
import * as encoding from './encoding';
import { fireAsync } from '../tools';
import { TransportOptions } from './transport';

const DOMAIN: string = 'rpc';
const SERVICES: string = 'services';
const REPLIES: string = 'replies';

interface Request {
  input: any;
  replyTopic: string;
}

interface Response {
  output: any;
  error: {
    message: string;
    stacktrace: string;
  };
}

class RpcError extends Error {
  constructor(public readonly remoteMessage: string, public readonly remoteStacktrace: string) {
    super(`A remote error occured: ${remoteMessage}`);
  }
}

class Service {
  private readonly topic: string;

  constructor(private readonly client: Client, private readonly address: string, private readonly implementation: (data: any) => Promise<any>) {
    this.topic = this.client.buildTopic(DOMAIN, SERVICES, this.address);
  }

  async init() {
    this.client.on('message', this.onMessage);
    await this.client.subscribe(this.topic);
  }

  async terminate() {
    await this.client.unsubscribe(this.topic);
    this.client.off('message', this.onMessage);
  }

  private readonly onMessage = (topic: string, input: Buffer) => {
    if (topic !== this.topic) {
      return;
    }

    fireAsync(async () => {
      const request = encoding.readJson(input) as Request;
      const response = await this.handle(request);
      const output = encoding.writeJson(response);
      await this.client.publish(request.replyTopic, output);
    });
  }

  private async handle(request: Request): Promise<Response> {
    let error, output;
    try {
      output = await this.implementation(request.input);
    } catch (err) {
      error = {
        message: err.message,
        stacktrace: err.stacktrace
      };
    }
    return { error, output };
  }
}

export class Rpc {
  private readonly services: Map<string, Service> = new Map<string, Service>();

  constructor(private readonly client: Client, options: TransportOptions) {
  }

  async serve(address: string, implementation: (data: any) => Promise<any>): Promise<void> {
    const existing = this.services.get(address);
    if (existing) {
      throw new Error(`Service with address '${address}' does already exist`);
    }

    const service = new Service(this.client, address, implementation);
    this.services.set(address, service);
    await service.init();
  }

  async unserve(address: string): Promise<void> {
    const service = this.services.get(address);
    if (!service) {
      throw new Error(`Service with address '${address}' does not exist`);
    }

    await service.terminate();
    this.services.delete(address);
  }

  async call(targetInstance: string, address: string, data: any = null, timeout: number = 2000): Promise<any> {
    const id = randomTopicPart();
    const replyTopic = this.client.buildTopic(DOMAIN, REPLIES, id);
    const request: Request = { input: data, replyTopic };
    await this.client.publish(this.client.buildRemoteTopic(targetInstance, DOMAIN, SERVICES, address), encoding.writeJson(request));

    const buffer = await waitForMessage(this.client, replyTopic, timeout);
    const response = encoding.readJson(buffer) as Response;
    const { error, output } = response;
    if (error) {
      throw new RpcError(error.message, error.stacktrace);
    }

    return output;
  }
}

async function waitForMessage(client: Client, topic: string, timeout: number): Promise<Buffer> {
  client.subscribe(topic);
  try {
    return await new Promise((resolve, reject) => {

      const onEnd = () => {
        clearTimeout(timer);
        client.off('message', messageCb);
      };

      const messageCb = (mtopic: string, payload: Buffer) => {
        if (topic !== mtopic) {
          return;
        }

        onEnd();
        resolve(payload);
      };

      const timer = setTimeout(() => {
        onEnd();
        reject(new Error(`Timeout occured while waiting for message on topic '${topic}'`));
      }, timeout);

      client.on('message', messageCb);
    });
  } finally {
    client.unsubscribe(topic);
  }
}

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CHARSET_LEN = CHARSET.length;
const LEN = 16;

function randomTopicPart() {
  const array = new Array(LEN);
  for (let i = 0; i < LEN; ++i) {
    array[i] = CHARSET.charAt(Math.floor(Math.random() * CHARSET_LEN));
  }
  return array.join('');
}