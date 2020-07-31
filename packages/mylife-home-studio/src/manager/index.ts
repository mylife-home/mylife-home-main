import { WebServer } from '../web';

export class Manager {
  private readonly webServer: WebServer;

  constructor() {
    this.webServer = new WebServer();
  }

  async init() { }

  async terminate() {
    await this.webServer.terminate();
  }
}
