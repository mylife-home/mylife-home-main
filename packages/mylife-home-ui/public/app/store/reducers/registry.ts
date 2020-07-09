import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Map } from 'immutable';
import { Reset, ComponentAdd, ComponentRemove, StateChange, ComponentStates } from '../../../../shared/registry';
import { AttributesState, REGISTRY_RESET, REGISTRY_COMPONENT_ADD, REGISTRY_COMPONENT_REMOVE, REGISTRY_ATTRIBUTE_CHANGE } from '../types/registry';

function createAttributes(raw: ComponentStates): AttributesState {
  return Map<string, any>().withMutations((map) => {
    for (const name of Object.keys(raw)) {
      map.set(name, raw[name]);
    }
  });
}

export default createReducer(Map<string, Map<string, any>>(), {
  [REGISTRY_RESET]: (state, action: PayloadAction<Reset>) =>
    state.clear().withMutations((map) => {
      for (const id of Object.keys(action.payload)) {
        map.set(id, createAttributes(action.payload[id]));
      }
    }),

  [REGISTRY_COMPONENT_ADD]: (state, action: PayloadAction<ComponentAdd>) => state.set(action.payload.id, createAttributes(action.payload.attributes)),
  [REGISTRY_COMPONENT_REMOVE]: (state, action: PayloadAction<ComponentRemove>) => state.delete(action.payload.id),
  [REGISTRY_ATTRIBUTE_CHANGE]: (state, action: PayloadAction<StateChange>) => state.update(action.payload.id, (val) => val.set(action.payload.name, action.payload.value)),
});
