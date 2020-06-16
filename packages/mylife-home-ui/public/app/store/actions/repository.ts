import { createAction } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';
import { RepositoryReset, RepositoryAdd, RepositoryRemove, RepositoryChange } from '../types/repository';

export const repositoryReset = createAction<RepositoryReset>(actionTypes.REPOSITORY_STATE);
export const repositoryAdd = createAction<RepositoryAdd>(actionTypes.REPOSITORY_ADD);
export const repositoryRemove = createAction<RepositoryRemove>(actionTypes.REPOSITORY_REMOVE);
export const repositoryChange = createAction<RepositoryChange>(actionTypes.REPOSITORY_CHANGE);
