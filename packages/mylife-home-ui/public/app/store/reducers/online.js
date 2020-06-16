'use strict';

import { handleActions } from 'redux-actions';
import * as actionTypes from '../constants/action-types';

export default handleActions({

  [actionTypes.SOCKET_CONNECT] : {
    next : () => true
  },

  [actionTypes.SOCKET_DISCONNECT] : {
    next : () => false
  }

}, false);
