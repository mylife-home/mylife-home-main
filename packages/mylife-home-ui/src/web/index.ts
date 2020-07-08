import { EventEmitter } from 'events';
import path from 'path';
import http from 'http';
import io from 'socket.io';
import express from 'express';
import enableDestroy from 'server-destroy';
import favicon from 'serve-favicon';
import serveStatic from 'serve-static';
import { components, tools } from 'mylife-home-common';
import { model } from '../model';

export declare interface WebServer extends EventEmitter {
  on(event: 'io.connection', listener: (socket: io.Socket) => void): this;
  off(event: 'io.connection', listener: (socket: io.Socket) => void): this;
  once(event: 'io.connection', listener: (socket: io.Socket) => void): this;
}

export class WebServer extends EventEmitter {
  private readonly httpServer: http.Server;

  constructor(registry: components.Registry) {
    super();

    type WebConfig = { port: number; staticDirectory: string; };
    const webConfig = tools.getConfigItem<WebConfig>('web');

    const app = express();

    const publicDirectory = path.resolve(__dirname, webConfig.staticDirectory);

    app.use(favicon(path.join(publicDirectory, 'images/favicon.ico')));
    app.use('/repository', createRepository(registry));
    app.use('/resources', createResources());
    app.use(serveStatic(publicDirectory));

    this.httpServer = new http.Server(app);
    enableDestroy(this.httpServer);

    const ioServer = io(this.httpServer, { serveClient: false });
    ioServer.on('connection', (socket) => this.emit('io.connection', socket));

    this.httpServer.listen(webConfig.port);
  }

  async terminate() {
    await new Promise((resolve) => this.httpServer.destroy(resolve));
  }
}

function createRepository(registry: components.Registry) {

  const router = express.Router();

  router.route('/action/:componentId/:actionName').get((req, res) => {
    const { componentId, actionName } = req.params;
    const component = registry.getComponent(componentId);
    component.executeAction(actionName, true);
    component.executeAction(actionName, false);
    return res.status(200);
  });

  router.route('/components').get((req, res) => {
    const result = Array.from(registry.getComponents()).map(component => component.id);
    return res.json(result);
  });

  router.route('/state/:componentId').get((req, res) => {
    const { componentId } = req.params;
    const component = registry.getComponent(componentId);
    const result = component.getStates();
    return res.json(result);
  });

  return router;
}

function createResources() {
  const router = express.Router();
  router.route('/enum').get((req, res) => res.json(Object.keys(model)));
  router.route('/get/:key').get((req, res) => res.json(model[req.params.key]));
  return router;
}
