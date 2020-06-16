'use strict';

import { createAction } from 'redux-actions';
import * as actionTypes from '../constants/action-types';

export const socketConnect = createAction(actionTypes.SOCKET_CONNECT);
export const socketDisconnect = createAction(actionTypes.SOCKET_DISCONNECT);
