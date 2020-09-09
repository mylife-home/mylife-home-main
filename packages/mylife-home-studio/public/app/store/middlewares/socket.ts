import { Middleware } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import io from 'socket.io-client';

import { online } from '../status/actions';

export const socketMiddleware: Middleware = (store) => (next) => {
  const socket = io();

  socket.on('connect', () => next(online(true)));
  socket.on('disconnect', () => next(online(false)));

  socket.on('message', (payload: any) => {

  });

  // socket.send();
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
