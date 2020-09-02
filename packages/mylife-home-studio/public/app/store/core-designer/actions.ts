import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, ComponentMoveAction } from './types';

export const componentMove = createAction<ComponentMoveAction>(ActionTypes.COMPONENT_MOVE);
