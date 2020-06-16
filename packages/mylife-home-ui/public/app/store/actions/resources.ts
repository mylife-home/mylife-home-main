'use strict';

import { createAction } from '@reduxjs/toolkit';
import { AppThunkAction } from '../types';
import { ResourceQuery, ResourceGet, RESOURCE_QUERY, RESOURCE_GET } from '../types/resources';
import { getResource } from '../selectors/resources';

const internalResourceQuery = createAction<ResourceQuery>(RESOURCE_QUERY);
const internalResourceGet = createAction<ResourceGet>(RESOURCE_GET);

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
