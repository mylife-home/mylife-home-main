import { createAction } from '@reduxjs/toolkit';
import { REGISTRY_RESET, REGISTRY_COMPONENT_ADD, REGISTRY_COMPONENT_REMOVE, REGISTRY_ATTRIBUTE_CHANGE } from '../types/registry';
import { Reset, ComponentAdd, ComponentRemove, StateChange } from '../../../../shared/registry';

export const reset = createAction<Reset>(REGISTRY_RESET);
export const componentAdd = createAction<ComponentAdd>(REGISTRY_COMPONENT_ADD);
export const componentRemove = createAction<ComponentRemove>(REGISTRY_COMPONENT_REMOVE);
export const attributeChange = createAction<StateChange>(REGISTRY_ATTRIBUTE_CHANGE);
