import path from 'path';
import http from 'http';
import io from 'socket.io';
import express from 'express';
import enableDestroy from 'server-destroy';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import serveStatic from 'serve-static';
import { components } from 'mylife-home-common';
import { createRepository } from './repository';
import { createResources } from './resources';
import { Repository } from '../net';

export default class WebServer {
  private _server: http.Server;

  constructor(private readonly registry: components.Registry, netRepository: Repository, sessionCreator: (socket: io.Socket) => void, webConfig: { port: number, staticDirectory: string }) {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const publicDirectory = path.resolve(__dirname, webConfig.staticDirectory);

    app.use(favicon(path.join(publicDirectory, 'images/favicon.ico')));
    app.use('/repository', createRepository(registry, netRepository));
    app.use('/resources', createResources());
    app.use(serveStatic(publicDirectory));

    this._server = new http.Server(app);
    enableDestroy(this._server);
    io(this._server, { serveClient: false }).on('connection', sessionCreator);

    this._server.listen(webConfig.port);
  }

  close(callback: (err?: Error) => void) {
    this._server.close(callback);
    this._server.destroy();
  }
}
