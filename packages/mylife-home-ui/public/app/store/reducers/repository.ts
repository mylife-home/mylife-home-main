import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Map } from 'immutable';
import { AttributesState, REPOSITORY_RESET, REPOSITORY_ADD, REPOSITORY_REMOVE, REPOSITORY_CHANGE } from '../types/repository';
import { Reset, ComponentAdd, ComponentRemove, StateChange, ComponentStates } from '../../../../shared/registry';

function createAttributes(raw: ComponentStates): AttributesState {
  return Map<string, any>().withMutations((map) => {
    for (const name of Object.keys(raw)) {
      map.set(name, raw[name]);
    }
  });
}

export default createReducer(Map<string, Map<string, any>>(), {
  [REPOSITORY_RESET]: (state, action: PayloadAction<Reset>) =>
    state.clear().withMutations((map) => {
      for (const id of Object.keys(action.payload)) {
        map.set(id, createAttributes(action.payload[id]));
      }
    }),

  [REPOSITORY_ADD]: (state, action: PayloadAction<ComponentAdd>) => state.set(action.payload.id, createAttributes(action.payload.attributes)),
  [REPOSITORY_REMOVE]: (state, action: PayloadAction<ComponentRemove>) => state.delete(action.payload.id),
  [REPOSITORY_CHANGE]: (state, action: PayloadAction<StateChange>) => state.update(action.payload.id, (val) => val.set(action.payload.name, action.payload.value)),
});
