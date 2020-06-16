'use strict';

import { createAction } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';

export interface Attributes {
  [id: string]: string;
}

export interface RepositoryReset {
  [id: string]: Attributes;
}

export interface RepositoryAdd {
  readonly id: string;
  readonly attributes: Attributes;
}

export interface RepositoryRemove {
  readonly id: string;
}

export interface RepositoryChange {
  readonly id: string;
  readonly name: string;
  readonly value: string;
}

export const repositoryReset = createAction<RepositoryReset>(actionTypes.REPOSITORY_STATE);
export const repositoryAdd = createAction<RepositoryAdd>(actionTypes.REPOSITORY_ADD);
export const repositoryRemove = createAction<RepositoryRemove>(actionTypes.REPOSITORY_REMOVE);
export const repositoryChange = createAction<RepositoryChange>(actionTypes.REPOSITORY_CHANGE);
