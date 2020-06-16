import { AppState } from '../types';

export const getResources = (state: AppState) => state.resources;
export const getResource = (state: AppState, { resource }: { resource: string; }) => getResources(state).get(resource);
