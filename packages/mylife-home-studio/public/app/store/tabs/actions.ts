import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, NewTabAction, MoveTabAction, TabIdAction, ChangeTabTitleAction } from './types';

export const newTab = createAction<NewTabAction>(ActionTypes.NEW);
export const closeTab = createAction<TabIdAction>(ActionTypes.CLOSE);
export const activateTab = createAction<TabIdAction>(ActionTypes.ACTIVATE);
export const moveTab = createAction<MoveTabAction>(ActionTypes.MOVE);
export const changeTabTitle = createAction<ChangeTabTitleAction>(ActionTypes.CHANGE_TITLE);
