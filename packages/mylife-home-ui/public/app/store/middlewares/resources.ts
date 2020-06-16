'use strict';

import { Middleware, Action } from 'redux';
import request from 'superagent';
import * as actionTypes from '../constants/action-types';
import { resourceGet } from '../actions/resources';
import { ThunkDispatch } from 'redux-thunk';

// FIXME: real types
export const resourcesMiddleware: Middleware = (store) => (next: ThunkDispatch<{}, {}, Action>) => (action) => {
  switch (action.type) {
    case actionTypes.RESOURCE_QUERY:
      request.get(`/resources/get/${action.payload.resource}`).end((err, res) => {
        if (err) {
          console.error('Error fetching resource', action.payload.resource, err);
          return;
        }
        
        return next(resourceGet({ ...action.payload, content: JSON.parse(res.text) }));
      });
      break;
  }

  return next(action);
};
