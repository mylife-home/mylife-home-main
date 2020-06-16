import { Middleware } from 'redux';
import io from 'socket.io-client';
import * as actionTypes from '../constants/action-types';
import { setOnline } from '../actions/online';
import { repositoryState, repositoryAdd, repositoryRemove, repositoryChange } from '../actions/repository';

export const socketMiddleware: Middleware = (store) => (next) => {
  const socket = io();

  socket.on('connect', () => next(setOnline(true)));
  socket.on('disconnect', () => next(setOnline(false)));

  // FIXME: types
  socket.on('state', (data: any) => next(repositoryState(data)));
  socket.on('add', (data: any) => next(repositoryAdd(data)));
  socket.on('remove', (data: any) => next(repositoryRemove(data)));
  socket.on('change', (data: any) => next(repositoryChange(data)));

  return (action) => {
    switch (action.type) {
      case actionTypes.ACTION_COMPONENT:
        socket.emit('action', action.payload);
        break;
    }

    return next(action);
  };
};
