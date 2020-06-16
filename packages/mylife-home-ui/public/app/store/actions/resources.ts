'use strict';

import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { createAction } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';
import { getResource } from '../selectors/resources';
import { RootState } from '../reducers';


// FIXME: real types
type ThunkResult<R = void> = ThunkAction<R, RootState, void, AnyAction>;

type Content = any;
type ResourceCallback = (err: Error, content: Content) => void;

export interface ResourceQuery {
  readonly resource: string;
  readonly done: ResourceCallback;
}

export interface ResourceGet extends ResourceQuery {
  readonly content: Content;
}

// FIXME: real types
const internalResourceQuery = createAction<ResourceQuery>(actionTypes.RESOURCE_QUERY);
const internalResourceGet = createAction<ResourceGet>(actionTypes.RESOURCE_GET);

const resourceGet = (args: ResourceGet): ThunkResult => (dispatch) => {
  dispatch(internalResourceGet(args));
  
  if(args.done) {
    args.done(null, args.content);
  }
};

const resourceQuery = ({ resource, done }: ResourceQuery): ThunkResult => (dispatch, getState) => {
  const state = getState();
  const content = getResource(state, { resource });
  if (content) {
    return dispatch(resourceGet({ resource, done, content }));
  }

  return dispatch(internalResourceQuery({ resource, done }));
};

export { resourceGet, resourceQuery };
