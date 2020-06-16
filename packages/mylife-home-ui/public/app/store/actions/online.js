'use strict';

import { createAction } from 'redux-actions';
import { actionTypes } from '../constants';

export const socketConnect = createAction(actionTypes.SOCKET_CONNECT);
export const socketDisconnect = createAction(actionTypes.SOCKET_DISCONNECT);
