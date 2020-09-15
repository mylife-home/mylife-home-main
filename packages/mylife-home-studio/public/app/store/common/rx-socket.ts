import { from, fromEvent, merge } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';
import SocketIOClient from 'socket.io-client';
import { ServiceRequest, ServerMessage, ServiceResponse, Notification } from '../../../../shared/protocol';

export class RxSocket {
  private readonly socket = SocketIOClient();

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

  call(service: string, payload: any) {
    return from(serviceCall(this.socket, service, payload));
  }
}

export const socket = new RxSocket();

const TIMEOUT = 60000;

let requestIdGenerator = 0;

class ServerError extends Error {
  public readonly serverType: string;
  public readonly serverStack: string;

  constructor(serverError: { type: string; message: string; stack: string; }) {
    super(`An error occured server-side: ${serverError.message}`);
    this.serverType = serverError.type;
    this.serverStack = serverError.stack;
  }
}

async function serviceCall(socket: SocketIOClient.Socket, service: string, payload: any) {
  return new Promise<any>((resolve, reject) => {
    if (!socket.connected) {
      return reject(new Error(`Cannot send request while disconnected: (service='${service}')`));
    }

    const requestId = `${++requestIdGenerator}`;

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
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
      clearTimeout(timeout);
    };

    const request: ServiceRequest = { requestId, service, payload };
    socket.send(request);

    socket.on('message', onMessage);
    socket.on('disconnect', onDisconnect);
    const timeout = setTimeout(onTimeout, TIMEOUT);
  });
}

