import { Middleware } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import 'whatwg-fetch';
import { ResourceQuery, RESOURCE_QUERY } from '../types/resources';

export const resourcesMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === RESOURCE_QUERY) {
    const typedAction = action as PayloadAction<ResourceQuery>;
    const { onContent, resource } = typedAction.payload;
    fetchResource(resource).then(onContent);
  }

  return next(action);
};

/*
Use when we support async/await

async function fetchResource(resource: string) {
  try {
    const res = await fetch(`/resources/${resource}`);

    if (res.status >= 400 && res.status < 600) {
      throw new Error(`HTTP error: ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`Error fetching resource '${resource}'`, err);
  }
}*/

function fetchResource(resource: string) {
  return fetch(`/resources/${resource}`)
    .then(handleErrors)
    .then(res => res.json())
    .catch(err => console.error(`Error fetching resource '${resource}'`, err));
}

function handleErrors(res: Response) {
  if (res.status >= 400 && res.status < 600) {
    throw new Error(`HTTP error: ${res.status}: ${res.statusText}`);
  }
  return res;
}