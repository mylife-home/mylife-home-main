'use strict';

import { createAction } from 'redux-actions';
import { actionTypes } from '../constants';

export const clearError = createAction(actionTypes.CLEAR_ERROR);
