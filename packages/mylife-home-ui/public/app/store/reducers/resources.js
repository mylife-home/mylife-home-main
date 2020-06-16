'use strict';

import { handleActions } from 'redux-actions';
import { actionTypes } from '../constants';
import Immutable from 'immutable';

export default handleActions({

  [actionTypes.RESOURCE_GET] : {
    next : (state, action) => state.set(action.payload.resource, action.payload.content)
  }

}, Immutable.Map());
