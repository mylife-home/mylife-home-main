import { createAction } from '@reduxjs/toolkit';
import { RepositoryReset, RepositoryAdd, RepositoryRemove, RepositoryChange, REPOSITORY_RESET, REPOSITORY_ADD, REPOSITORY_REMOVE, REPOSITORY_CHANGE } from '../types/repository';

export const repositoryReset = createAction<RepositoryReset>(REPOSITORY_RESET);
export const repositoryAdd = createAction<RepositoryAdd>(REPOSITORY_ADD);
export const repositoryRemove = createAction<RepositoryRemove>(REPOSITORY_REMOVE);
export const repositoryChange = createAction<RepositoryChange>(REPOSITORY_CHANGE);
