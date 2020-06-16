import { Map } from 'immutable';

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

export type AttributesState = Map<string, string>;
export type RepositoryState = Map<string, AttributesState>;
