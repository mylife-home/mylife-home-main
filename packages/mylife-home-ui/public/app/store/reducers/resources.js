'use strict';

import { createReducer } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';
import Immutable from 'immutable';

export default createReducer(Immutable.Map(), {

  [actionTypes.RESOURCE_GET] :  (state, action) => state.set(action.payload.resource, action.payload.content)

});
