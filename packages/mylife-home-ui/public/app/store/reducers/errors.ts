'use strict';

import { Action } from 'redux-actions';
import * as actionTypes from '../constants/action-types';

export default function(state: Error = null, action: Action<Error>) {
  if(action.error) {
    return action.payload;
  }

  if(action.type === actionTypes.CLEAR_ERROR) {
    return null;
  }

  return state;
}
