'use strict';

import { createAction } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';
import { getResource } from '../selectors/resources';
import { AppThunkAction } from '../types';
import { ResourceQuery, ResourceGet } from '../types/resources';

const internalResourceQuery = createAction<ResourceQuery>(actionTypes.RESOURCE_QUERY);
const internalResourceGet = createAction<ResourceGet>(actionTypes.RESOURCE_GET);

const resourceGet = (args: ResourceGet): AppThunkAction => (dispatch) => {
  dispatch(internalResourceGet(args));
  
  if(args.done) {
    args.done(null, args.content);
  }
};

const resourceQuery = ({ resource, done }: ResourceQuery): AppThunkAction => (dispatch, getState) => {
  const state = getState();
  const content = getResource(state, { resource });
  if (content) {
    return dispatch(resourceGet({ resource, done, content }));
  }

  return dispatch(internalResourceQuery({ resource, done }));
};

export { resourceGet, resourceQuery };
