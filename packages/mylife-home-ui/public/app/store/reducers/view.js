'use strict';

import { createReducer } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';
import Immutable from 'immutable';

export default createReducer(Immutable.List(), {

  [actionTypes.VIEW_POPUP] : (state, action) => state.push(action.payload),

  [actionTypes.VIEW_CLOSE] : (state/*, action*/) => state.pop(),

  [actionTypes.VIEW_CHANGE] : (state, action) => state.clear().push(action.payload)

});
