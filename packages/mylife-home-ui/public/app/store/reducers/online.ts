import { createReducer } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';

export default createReducer(false, {

  [actionTypes.SET_ONLINE] :  (state, action) => action.payload

});
