import http from 'http';
import { bus } from 'mylife-home-common';

export interface Service {
  init(): Promise<void>;
  terminate(): Promise<void>;
}

export interface BuildParams {
  readonly transport: bus.Transport;
  readonly httpServer: http.Server;
}
