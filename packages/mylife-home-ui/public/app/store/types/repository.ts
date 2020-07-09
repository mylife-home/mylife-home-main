import { Map } from 'immutable';

export const REPOSITORY_RESET = 'repository/reset';
export const REPOSITORY_ADD = 'repository/add';
export const REPOSITORY_REMOVE = 'repository/remove';
export const REPOSITORY_CHANGE = 'repository/change';

export type AttributesState = Map<string, any>;
export type RepositoryState = Map<string, AttributesState>;
