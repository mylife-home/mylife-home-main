import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Map } from 'immutable';
import { ResourceGet, RESOURCE_GET } from '../types/resources';

export default createReducer(Map<string, any>(), {
  [RESOURCE_GET]: (state, action: PayloadAction<ResourceGet>) => state.set(action.payload.resource, action.payload.content),
});
