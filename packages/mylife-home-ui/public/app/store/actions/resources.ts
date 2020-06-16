'use strict';

import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { createAction } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';
import { getResource } from '../selectors';

// FIXME: real types
const internalResourceQuery = createAction<any>(actionTypes.RESOURCE_QUERY);
const internalResourceGet = createAction<any>(actionTypes.RESOURCE_GET);

// FIXME: real types
type ThunkResult<R> = ThunkAction<R, any, any, AnyAction>;

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
