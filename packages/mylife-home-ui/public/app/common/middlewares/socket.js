'use strict';

import io from 'socket.io-client';
import { actionTypes } from '../constants/index';
import { getLocation } from '../utils/location';
import { socketConnect, socketDisconnect } from '../actions/online';
import { repositoryState, repositoryAdd, repositoryRemove, repositoryChange } from '../actions/repository';

const middleware = (/*store*/) => next => {
  const socket = io(getLocation());

  socket.on('connect',    () => next(socketConnect()));
  socket.on('disconnect', () => next(socketDisconnect()));

  socket.on('state',  (data) => next(repositoryState(data)));
  socket.on('add',    (data) => next(repositoryAdd(data)));
  socket.on('remove', (data) => next(repositoryRemove(data)));
  socket.on('change', (data) => next(repositoryChange(data)));

  return action => {
    next(action);

    switch (action.type) {
      case actionTypes.ACTION_COMPONENT:
        socket.emit('action', action.payload);
        break;
    }
  };
};

export default middleware;
