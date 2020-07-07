import path from 'path';
import http from 'http';
import io from 'socket.io';
import express from 'express';
import enableDestroy from 'server-destroy';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import serveStatic from 'serve-static';
import { components, tools } from 'mylife-home-common';
import { model } from '../model';

export default class WebServer {
  private _server: http.Server;

  constructor(registry: components.Registry, sessionCreator: (socket: io.Socket) => void) {
    type WebConfig = { port: number; staticDirectory: string };
    const webConfig = tools.getConfigItem<WebConfig>('web');

    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const publicDirectory = path.resolve(__dirname, webConfig.staticDirectory);

    app.use(favicon(path.join(publicDirectory, 'images/favicon.ico')));
    app.use('/repository', createRepository(registry));
    app.use('/resources', createResources());
    app.use(serveStatic(publicDirectory));

    this._server = new http.Server(app);
    enableDestroy(this._server);
    io(this._server, { serveClient: false }).on('connection', sessionCreator);

    this._server.listen(webConfig.port);
  }

  async close() {
    await new Promise((resolve, reject) => this._server.close((err) => err ? reject(err) : resolve()));
    this._server.destroy();
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
