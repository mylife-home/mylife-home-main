'use strict';

import * as actionTypes from '../constants/action-types';

export default function(state = null, action) {
  if(action.error) {
    return action.payload;
  }

  if(action.type === actionTypes.CLEAR_ERROR) {
    return null;
  }

  return state;
}
