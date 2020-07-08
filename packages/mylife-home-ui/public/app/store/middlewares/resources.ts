import { Middleware } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import request from 'superagent';
import { ResourceQuery, RESOURCE_QUERY } from '../types/resources';

export const resourcesMiddleware: Middleware = (store) => (next) => (action) => {
  switch (action.type) {
    case RESOURCE_QUERY:
      const typedAction = action as PayloadAction<ResourceQuery>;
      const { done, resource } = typedAction.payload;
      request.get(`/resources/${resource}`).end((err, res) => err ? done(err) : done(null, res.text));
      break;
  }

  return next(action);
};
