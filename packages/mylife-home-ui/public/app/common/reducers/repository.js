'use strict';

import { handleActions } from 'redux-actions';
import { actionTypes } from '../constants/index';
import Immutable from 'immutable';

function createAttributes(raw) {
  return Immutable.Map().withMutations(map => {
    for(const name of Object.keys(raw)) {
      map.set(name, raw[name]);
    }
  });
}

export default handleActions({

  [actionTypes.REPOSITORY_STATE] : {
    next : (state, action) => state.clear().withMutations(map => {
      for(const id of Object.keys(action.payload)) {
        map.set(id, createAttributes(action.payload[id]));
      }
    })
  },

  [actionTypes.REPOSITORY_ADD] : {
    next : (state, action) => state.set(action.payload.id, createAttributes(action.payload.attributes))
  },

  [actionTypes.REPOSITORY_REMOVE] : {
    next : (state, action) => state.delete(action.payload.id)
  },

  [actionTypes.REPOSITORY_CHANGE] : {
    next : (state, action) => state.update(action.payload.id, (val) => val.set(action.payload.name, action.payload.value))
  }

}, Immutable.Map());
