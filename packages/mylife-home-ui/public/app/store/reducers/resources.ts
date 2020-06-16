import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Map } from 'immutable';
import * as actionTypes from '../constants/action-types';
import { ResourceGet } from '../types/resources';

export default createReducer(Map<string, any>(), {
  [actionTypes.RESOURCE_GET]: (state, action: PayloadAction<ResourceGet>) => state.set(action.payload.resource, action.payload.content),
});
