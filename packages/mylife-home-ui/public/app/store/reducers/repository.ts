import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Map } from 'immutable';
import * as actionTypes from '../constants/action-types';
import { RepositoryReset, RepositoryAdd, RepositoryRemove, RepositoryChange, Attributes, AttributesState } from '../types/repository';

function createAttributes(raw: Attributes): AttributesState {
  return Map<string, string>().withMutations((map) => {
    for (const name of Object.keys(raw)) {
      map.set(name, raw[name]);
    }
  });
}

export default createReducer(Map<string, Map<string, string>>(), {
  [actionTypes.REPOSITORY_STATE]: (state, action: PayloadAction<RepositoryReset>) =>
    state.clear().withMutations((map) => {
      for (const id of Object.keys(action.payload)) {
        map.set(id, createAttributes(action.payload[id]));
      }
    }),

  [actionTypes.REPOSITORY_ADD]: (state, action: PayloadAction<RepositoryAdd>) => state.set(action.payload.id, createAttributes(action.payload.attributes)),
  [actionTypes.REPOSITORY_REMOVE]: (state, action: PayloadAction<RepositoryRemove>) => state.delete(action.payload.id),
  [actionTypes.REPOSITORY_CHANGE]: (state, action: PayloadAction<RepositoryChange>) => state.update(action.payload.id, (val) => val.set(action.payload.name, action.payload.value)),
});
