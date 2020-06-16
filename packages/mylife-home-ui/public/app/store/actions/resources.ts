'use strict';

import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { createAction } from 'redux-actions';
import { actionTypes } from '../constants';
import { getResource } from '../selectors';

const internalResourceQuery = createAction(actionTypes.RESOURCE_QUERY);
const internalResourceGet = createAction(actionTypes.RESOURCE_GET);

// FIXME: real types
type ThunkResult<R> = ThunkAction<R, {}, {}, AnyAction>;

// FIXME: no any
const resourceGet = ({ resource, content, done }: { resource: any, content: any, done: any }): ThunkResult<void> => (dispatch) => {
  dispatch(internalResourceGet({ resource, content, done }));
  done && done(null, content);
};

// FIXME: no any
const resourceQuery = ({ resource, done }: { resource: any, done: any }): ThunkResult<void> => (dispatch, getState) => {
  const state   = getState();
  const content = getResource(state, { resource });
  if(content) {
    return dispatch(resourceGet({ resource, done, content }));
  }
  return dispatch(internalResourceQuery({ resource, done }));
};

export { resourceGet, resourceQuery };
