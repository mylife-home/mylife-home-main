import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Reset, ComponentAdd, ComponentRemove, StateChange } from '../../../../shared/registry';
import { REGISTRY_RESET, REGISTRY_COMPONENT_ADD, REGISTRY_COMPONENT_REMOVE, REGISTRY_ATTRIBUTE_CHANGE, RepositoryState } from '../types/registry';

const DEFAULT: RepositoryState = {};

export default createReducer(DEFAULT, {
  [REGISTRY_RESET]: (state, action: PayloadAction<Reset>) => action.payload,
  [REGISTRY_COMPONENT_ADD]: (state, action: PayloadAction<ComponentAdd>) => ({ ...state, [action.payload.id]: action.payload.attributes }),
  [REGISTRY_COMPONENT_REMOVE]: (state, action: PayloadAction<ComponentRemove>) => deleteObjectKey(state, action.payload.id),
  [REGISTRY_ATTRIBUTE_CHANGE]: (state, action: PayloadAction<StateChange>) => ({
    ...state,
    [action.payload.id]: {
      ...state[action.payload.id],
      [action.payload.name]: action.payload.value
    }
  }),
});

function deleteObjectKey<T>(obj: {[id: string]: T}, key: string) :  {[id: string]: T} {
  const { [key]: removed, ...others} = obj;
  void removed;
  return others;
}