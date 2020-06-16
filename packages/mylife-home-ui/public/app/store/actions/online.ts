import { createAction } from 'redux-actions';
import * as actionTypes from '../constants/action-types';

export const setOnline = createAction<boolean>(actionTypes.SET_ONLINE);
