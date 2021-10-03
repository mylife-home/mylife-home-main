import { EventEmitter } from 'events';
import { Client } from './client';
import { repository } from './repository';

export class Driver extends EventEmitter {
  private client: Client;

  constructor(private readonly agentKey: string, private readonly nick: string, private readonly service: string) {
    super();

    repository.on('added', this.repositoryCallback);
    repository.on('removed', this.repositoryCallback);

    this.refreshClient();
  }

  destroy() {
    this.releaseClient(true);
    repository.off('added', this.repositoryCallback);
    repository.off('removed', this.repositoryCallback);
  }

  private readonly repositoryCallback = (key: string) => {
    if (key === this.agentKey) {
      this.refreshClient();
    }
  };

  private refreshClient() {
    const client = repository.get(this.agentKey);
    if (!client) {
      this.releaseClient();
      return;
    }

    if (this.client) {
      return;
    }

    this.client = client;
    this.client.on('clear', this.clearCallback);
    this.client.on('remove', this.removeCallback);
    this.client.on('add', this.addCallback);
    this.client.on('message', this.messageCallback);

    this.client.nicks.forEach(this.addCallback);
  }

  private releaseClient(closing = false) {
    if (!closing) {
      this.emit('online', false);
    }

    if (!this.client) {
      return;
    }

    this.client.off('clear', this.clearCallback);
    this.client.off('remove', this.removeCallback);
    this.client.off('add', this.addCallback);
    this.client.off('message', this.messageCallback);

    this.client = null;
  }

  private readonly clearCallback = () => {
    this.emit('online', false);
  };

  private readonly removeCallback = (nick: string) => {
    if (this.isMyNick(nick)) {
      this.emit('online', false);
    }
  };

  private readonly addCallback = (nick: string) => {
    if (this.isMyNick(nick)) {
      this.emit('online', true);
    }
  };

  private readonly messageCallback = (from: string, message: string) => {
    if (!this.isMyNick(from)) {
      return;
    }

    const split = message.split(' ', 2);
    if (!this.isMyService(split[1])) {
      return;
    }

    const data = message.substr(split[0].length + split[1].length + 2);
    this.emit('message', split[0], data);
  };

  private isMyNick(nick: string) {
    return nick.toUpperCase() === this.nick.toUpperCase();
  }

  private isMyService(service: string) {
    return service === this.service;
  }

  write(data: any) {
    if (!this.client) {
      return;
    }
    this.client.send(`${this.nick} ${this.service} ${JSON.stringify(data)}`);
  }

  query() {
    if (!this.client) {
      return;
    }
    this.client.send(`${this.nick} ${this.service}`);
  }
}
