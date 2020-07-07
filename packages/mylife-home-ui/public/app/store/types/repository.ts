import { Map } from 'immutable';

export const REPOSITORY_RESET = 'repository/reset';
export const REPOSITORY_ADD = 'repository/add';
export const REPOSITORY_REMOVE = 'repository/remove';
export const REPOSITORY_CHANGE = 'repository/change';

export interface Attributes {
  [id: string]: any;
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

export type AttributesState = Map<string, any>;
export type RepositoryState = Map<string, AttributesState>;
