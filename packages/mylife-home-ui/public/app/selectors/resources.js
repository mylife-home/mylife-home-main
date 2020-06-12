'use strict';

export const getResources = (state) => state.resources;
export const getResource  = (state, { resource }) => getResources(state).get(resource);
