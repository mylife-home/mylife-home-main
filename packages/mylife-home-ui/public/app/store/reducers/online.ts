'use strict';

import { handleActions } from 'redux-actions';
import * as actionTypes from '../constants/action-types';

export default handleActions({

  [actionTypes.SET_ONLINE] : {
    next : (state, action) => action.payload
  },

}, false);
