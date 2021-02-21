import path from 'path';
import http from 'http';
import express from 'express';
import enableDestroy from 'server-destroy';
import favicon from 'serve-favicon';
import serveStatic from 'serve-static';
import { tools } from 'mylife-home-common';

export class WebServer {
  readonly httpServer: http.Server;

  constructor() {
    type WebConfig = { port: number; staticDirectory: string; };
    const webConfig = tools.getConfigItem<WebConfig>('web');

    const app = express();

    const publicDirectory = path.resolve(__dirname, webConfig.staticDirectory);

    app.use(favicon(path.join(publicDirectory, 'images/favicon.ico')));
    app.use(serveStatic(publicDirectory));

    this.httpServer = new http.Server(app);
    enableDestroy(this.httpServer);

    this.httpServer.listen(webConfig.port);
  }

  async terminate() {
    await new Promise<void>((resolve) => this.httpServer.destroy(resolve));
  }
}
