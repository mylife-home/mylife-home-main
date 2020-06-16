'use strict';

import { createAction } from 'redux-actions';
import * as actionTypes from '../constants/action-types';

export const repositoryState  = createAction(actionTypes.REPOSITORY_STATE);
export const repositoryAdd    = createAction(actionTypes.REPOSITORY_ADD);
export const repositoryRemove = createAction(actionTypes.REPOSITORY_REMOVE);
export const repositoryChange = createAction(actionTypes.REPOSITORY_CHANGE);
