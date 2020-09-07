import { bus } from 'mylife-home-common';
import { Logging } from './logging';
import { Service } from './types';

export class Services {
  private readonly services: { [name: string]: Service } = {};

  constructor(transport: bus.Transport) {
    this.services.logging = new Logging(transport);
  }

  async init() {
    await Promise.all(Object.values(this.services).map(service => service.init()));
  }

  async terminate() {
    await Promise.all(Object.values(this.services).map(service => service.terminate()));
  }

  get logging() {
    return this.services.logging as Logging;
  }
}