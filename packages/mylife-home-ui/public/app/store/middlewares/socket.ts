import { Middleware } from 'redux';
import io from 'socket.io-client';
import * as actionTypes from '../constants/action-types';
import { RepositoryReset, RepositoryAdd, RepositoryRemove, RepositoryChange } from '../types/repository';
import { setOnline } from '../actions/online';
import { repositoryReset, repositoryAdd, repositoryRemove, repositoryChange } from '../actions/repository';

export const socketMiddleware: Middleware = (store) => (next) => {
  const socket = io();

  socket.on('connect', () => next(setOnline(true)));
  socket.on('disconnect', () => next(setOnline(false)));

  socket.on('state', (data: RepositoryReset) => next(repositoryReset(data)));
  socket.on('add', (data: RepositoryAdd) => next(repositoryAdd(data)));
  socket.on('remove', (data: RepositoryRemove) => next(repositoryRemove(data)));
  socket.on('change', (data: RepositoryChange) => next(repositoryChange(data)));

  return (action) => {
    switch (action.type) {
      case actionTypes.ACTION_COMPONENT:
        socket.emit('action', action.payload);
        break;
    }

    return next(action);
  };
};
