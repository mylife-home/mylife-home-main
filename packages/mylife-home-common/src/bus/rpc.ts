import { Client } from './client';

class Service {
  constructor(client: Client) {
  }

  async init() {

  }

  async terminate() {

  }
}

class Call {

}

export class Rpc {
  private readonly services: Map<string, Service>;

  constructor(private readonly client: Client) {
  }

  serve(address: string, implementation: (data: any) => Promise<any>): Promise<void> {
    this.client.on;
  }

  async call(targetInstace: string, address: string, data: any): Promise<any> {

  }
}