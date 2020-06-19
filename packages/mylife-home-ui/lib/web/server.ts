import path from 'path';
import { EventEmitter } from 'events';
import http from 'http';
import io from 'socket.io';
import express from 'express';
import enableDestroy from 'server-destroy';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import serveStatic from 'serve-static';
import webpack, { Configuration } from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import { createRepository } from './repository';
import { createResources } from './resources';
import webpackConfig from '../../webpack.config.dev.js';
import { Repository } from '../net';

export default class WebServer extends EventEmitter {
  private _server: http.Server;

  constructor(netRepository: Repository, sessionCreator: (socket: io.Socket) => void, webConfig: { port: number }, dev: boolean) {
    super();
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const publicDirectory = path.resolve(path.join(__dirname, '../../public'));

    if (dev) {
      console.log('setup webpack dev middleware'); // eslint-disable-line no-console
      const typedConfig = webpackConfig as Configuration;
      app.use(webpackMiddleware(webpack(typedConfig), { publicPath: typedConfig.output.publicPath }));
    }
    app.use(favicon(path.join(publicDirectory, 'images/favicon.ico')));
    app.use('/repository', createRepository(netRepository));
    app.use('/resources', createResources());
    app.use(serveStatic(publicDirectory));

    this._server = new http.Server(app);
    enableDestroy(this._server);
    io(this._server).on('connection', sessionCreator);

    this._server.listen(webConfig.port);
  }

  close(callback: (err?: Error) => void) {
    this._server.close(callback);
    this._server.destroy();
  }
}
