import { Middleware } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { ActionComponent } from '../../../../shared/model';
import { SocketMessage } from '../../../../shared/socket';
import { ACTION_COMPONENT } from '../types/actions';
import { onlineSet } from '../actions/online';
import { reset, componentAdd, componentRemove, attributeChange } from '../actions/registry';
import { modelInit } from '../actions/model';

class WebSocket extends ReconnectingWebSocket { }

export const socketMiddleware: Middleware = (store) => (next) => {
  const socket = new WebSocket(location.origin.replace(/^http/, 'ws'));

  socket.onopen = () => next(onlineSet(true));
  socket.onclose = () => next(onlineSet(false));

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
};

function send(socket: WebSocket, type: string, data: any) {
  const message: SocketMessage = { type: 'action', data };
  socket.send(JSON.stringify(message));
}