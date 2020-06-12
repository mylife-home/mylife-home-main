'use strict';

import { actionTypes } from '../constants/index';

export default function(state = null, action) {
  if(action.error) {
    return action.payload;
  }

  if(action.type === actionTypes.CLEAR_ERROR) {
    return null;
  }

  return state;
}
