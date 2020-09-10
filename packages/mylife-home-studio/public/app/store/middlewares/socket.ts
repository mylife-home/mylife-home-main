import { Middleware } from 'redux';
import SocketIOClient from 'socket.io-client';
import { ServiceRequest, ServiceResponse, ServerMessage, Notification } from '../../../../shared/protocol';

import { online } from '../status/actions';

export const socketMiddleware: Middleware = (store) => (next) => {
  const socket = SocketIOClient();

  socket.on('connect', () => next(online(true)));
  socket.on('disconnect', () => next(online(false)));

  socket.on('message', (message: ServerMessage) => {
    if (message.type !== 'notification') {
      return;
    }

    const notification = message as Notification;
  });

  /*
    socket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data) as SocketMessage;
      switch (message.type) {
        case 'state':
          next(reset(message.data));
          break;
  
        case 'add':
          next(componentAdd(message.data));
          break;
  
        case 'remove':
          next(componentRemove(message.data));
          break;
  
        case 'change':
          next(attributeChange(message.data));
          break;
  
        case 'modelHash':
          next(modelInit(message.data) as any); // TODO: proper cast: AppThunkAction => AnyAction
          break;
      }
    };
    
    return (action) => {
      if (action.type === ACTION_COMPONENT) {
        const typedAction = action as PayloadAction<ActionComponent>;
        send(socket, 'action', typedAction.payload);
      }
      
      return next(action);
    };
    */

  return action => next(action);
};

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

