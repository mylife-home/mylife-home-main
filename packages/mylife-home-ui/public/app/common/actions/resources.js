'use strict';

import { createAction } from 'redux-actions';
import { actionTypes } from '../constants';
import { getResource } from '../selectors/resources';

const internalResourceQuery = createAction(actionTypes.RESOURCE_QUERY);
const internalResourceGet = createAction(actionTypes.RESOURCE_GET);

const resourceGet = ({ resource, content, done }) => (dispatch) => {
  dispatch(internalResourceGet({ resource, content, done }));
  done && done(null, content);
};

const resourceQuery = ({ resource, done }) => (dispatch, getState) => {
  const state   = getState();
  const content = getResource(state, { resource });
  if(content) {
    return dispatch(resourceGet({ resource, done, content }));
  }
  return dispatch(internalResourceQuery({ resource, done }));
};

export { resourceGet, resourceQuery };
