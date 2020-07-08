import { Middleware } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import io from 'socket.io-client';
import { ACTION_COMPONENT, ComponentAction } from '../types/actions';
import { RepositoryReset, RepositoryAdd, RepositoryRemove, RepositoryChange } from '../types/repository';
import { onlineSet } from '../actions/online';
import { repositoryReset, repositoryAdd, repositoryRemove, repositoryChange } from '../actions/repository';
import { modelInit } from '../actions/model';

export const socketMiddleware: Middleware = (store) => (next) => {
  const socket = io();

  socket.on('connect', () => next(onlineSet(true)));
  socket.on('disconnect', () => next(onlineSet(false)));

  socket.on('state', (data: RepositoryReset) => next(repositoryReset(data)));
  socket.on('add', (data: RepositoryAdd) => next(repositoryAdd(data)));
  socket.on('remove', (data: RepositoryRemove) => next(repositoryRemove(data)));
  socket.on('change', (data: RepositoryChange) => next(repositoryChange(data)));
  socket.on('modelHash', (modelHash: string) => next(modelInit(modelHash) as any)); // TODO: proper cast: AppThunkAction => AnyAction

  return (action) => {
    switch (action.type) {
      case ACTION_COMPONENT:
        const typedAction = action as PayloadAction<ComponentAction>;
        socket.emit('action', typedAction.payload);
        break;
    }

    return next(action);
  };
};
