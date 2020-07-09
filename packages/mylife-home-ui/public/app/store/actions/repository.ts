import { createAction } from '@reduxjs/toolkit';
import { REPOSITORY_RESET, REPOSITORY_ADD, REPOSITORY_REMOVE, REPOSITORY_CHANGE } from '../types/repository';
import { Reset, ComponentAdd, ComponentRemove, StateChange } from '../../../../shared/registry';

export const repositoryReset = createAction<Reset>(REPOSITORY_RESET);
export const repositoryAdd = createAction<ComponentAdd>(REPOSITORY_ADD);
export const repositoryRemove = createAction<ComponentRemove>(REPOSITORY_REMOVE);
export const repositoryChange = createAction<StateChange>(REPOSITORY_CHANGE);
