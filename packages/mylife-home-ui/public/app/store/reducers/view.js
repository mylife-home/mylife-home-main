'use strict';

import { handleActions } from 'redux-actions';
import * as actionTypes from '../constants/action-types';
import Immutable from 'immutable';

export default handleActions({

  [actionTypes.VIEW_POPUP] : {
    next : (state, action) => state.push(action.payload)
  },

  [actionTypes.VIEW_CLOSE] : {
    next : (state/*, action*/) => state.pop()
  },

  [actionTypes.VIEW_CHANGE] : {
    next : (state, action) => state.clear().push(action.payload)
  }

}, Immutable.List());
