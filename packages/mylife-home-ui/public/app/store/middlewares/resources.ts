import { Middleware, Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import request from 'superagent';
import * as actionTypes from '../constants/action-types';
import { ResourceQuery } from '../types/resources';
import { resourceGet } from '../actions/resources';
import { AppThunkDispatch } from '../types';

export const resourcesMiddleware: Middleware = (store) => (next: AppThunkDispatch) => (action: Action) => {
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
