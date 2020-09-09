import { createAction } from '@reduxjs/toolkit';
import { ActionTypes } from './types';

export const online = createAction<boolean>(ActionTypes.ONLINE);
