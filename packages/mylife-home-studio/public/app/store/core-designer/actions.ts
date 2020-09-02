import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, MoveComponentAction } from './types';

export const moveComponent = createAction<MoveComponentAction>(ActionTypes.MOVE_COMPONENT);
