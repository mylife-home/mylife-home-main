'use strict';

import { Middleware, Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import request from 'superagent';
import * as actionTypes from '../constants/action-types';
import { resourceGet, ResourceQuery } from '../actions/resources';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from '../reducers';

export const resourcesMiddleware: Middleware = (store) => (next: ThunkDispatch<RootState, void, Action>) => (action: Action) => {
  switch (action.type) {
    case actionTypes.RESOURCE_QUERY:
      const typedAction = action as PayloadAction<ResourceQuery>;
      request.get(`/resources/get/${typedAction.payload.resource}`).end((err, res) => {
        if (err) {
          console.error('Error fetching resource', typedAction.payload.resource, err);
          return;
        }
        
        return next(resourceGet({ ...typedAction.payload, content: JSON.parse(res.text) }));
      });
      break;
  }

  return next(action);
};
