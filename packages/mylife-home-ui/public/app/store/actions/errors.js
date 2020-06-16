'use strict';

import { createAction } from 'redux-actions';
import * as actionTypes from '../constants/action-types';

export const clearError = createAction(actionTypes.CLEAR_ERROR);

export const noop = createAction(actionTypes.NOOP);