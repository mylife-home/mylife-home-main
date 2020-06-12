'use strict';

import { handleActions } from 'redux-actions';
import { actionTypes } from '../constants/index';

export default handleActions({

  [actionTypes.SOCKET_CONNECT] : {
    next : () => true
  },

  [actionTypes.SOCKET_DISCONNECT] : {
    next : () => false
  }

}, false);
