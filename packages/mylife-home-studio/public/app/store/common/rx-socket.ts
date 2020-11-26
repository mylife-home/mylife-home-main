import { from, fromEvent, merge, Subject } from 'rxjs';
import { filter, map, mapTo } from 'rxjs/operators';
import SocketIOClient from 'socket.io-client';
import { ServiceRequest, ServerMessage, ServiceResponse, Notification } from '../../../../shared/protocol';

const TIMEOUT = 60000;

export interface RequestEvent {
  type: 'begin' | 'end';
  id: string;
}

export interface BeginRequestEvent extends RequestEvent {
  type: 'begin';
  service: string;
}

export interface EndRequestEvent extends RequestEvent {
  type: 'end';
}

export class RxSocket {
  private readonly socket = SocketIOClient();
  private readonly request$ = new Subject<RequestEvent>();
  private readonly requestIdGenerator = new IdGenerator();

  online() {
    const connect$ = fromEvent<void>(this.socket, 'connect');
    const disconnect$ = fromEvent<void>(this.socket, 'disconnect');

    return merge(
      connect$.pipe(mapTo(true)),
      disconnect$.pipe(mapTo(false)),
    );
  }

  notifications() {
    const message$ = fromEvent<ServerMessage>(this.socket, 'message');
    return message$.pipe(
      filter(msg => msg.type === 'notification'),
      map(msg => msg as Notification)
    );
  }

  request() {
    return this.request$.asObservable();
  }

  call(service: string, payload: any) {
    return from(this.wrapServiceCall(service, payload));
  }

  private async wrapServiceCall(service: string, payload: any) {
    const id = this.requestIdGenerator.generate();
    
    this.request$.next({ type: 'begin', id, service } as BeginRequestEvent);
    try {
      return await this.serviceCall(id, service, payload);
    } finally {
      this.request$.next({ type: 'end', id } as EndRequestEvent);
    }
  }

  private async serviceCall(requestId: string, service: string, payload: any) {
    return new Promise<any>((resolve, reject) => {
      if (!this.socket.connected) {
        return reject(new Error(`Cannot send request while disconnected: (service='${service}')`));
      }

      const onMessage = (message: ServerMessage) => {
        if (message.type !== 'service-response') {
          return;
        }

        const serviceResponse = message as ServiceResponse;
        if (serviceResponse.requestId !== requestId) {
          return;
        }

        cleanup();

        const { error, result } = serviceResponse;
        if (error) {
          return reject(new ServerError(error));
        }

        resolve(result);
      };

      const onDisconnect = () => {
        cleanup();
        reject(new Error(`Disconnection while waiting response: (service='${service}')`));
      };

      const onTimeout = () => {
        cleanup();
        reject(new Error(`Request timeout after ${TIMEOUT / 1000} seconds: (service='${service}')`));
      };

      const cleanup = () => {
        this.socket.off('disconnect', onDisconnect);
        this.socket.off('message', onMessage);
        clearTimeout(timeout);
      };

      const request: ServiceRequest = { requestId, service, payload };
      this.socket.send(request);

      this.socket.on('message', onMessage);
      this.socket.on('disconnect', onDisconnect);
      const timeout = setTimeout(onTimeout, TIMEOUT);
    });
  }
}

export const socket = new RxSocket();

class ServerError extends Error {
  public readonly serverType: string;
  public readonly serverStack: string;

  constructor(serverError: { type: string; message: string; stack: string; }) {
    super(`An error occured server-side: ${serverError.message}`);
    this.serverType = serverError.type;
    this.serverStack = serverError.stack;
  }
}

class IdGenerator {
  private counter = 0;

  generate() {
    return `${++this.counter}`;
  }
}
