import { createAction } from '@reduxjs/toolkit';
import * as actionTypes from '../constants/action-types';

export const setOnline = createAction<boolean>(actionTypes.SET_ONLINE);
