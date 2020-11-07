import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { getTabsCount } from '../tabs/selectors';
import { TabType } from '../tabs/types';

export const hasDeployTab = (state: AppState) => getTabsCount(state, TabType.DEPLOY) > 0;

const getDeploy = (state: AppState) => state.deploy;
export const getNotifierId = (state: AppState) => getDeploy(state).notifierId;

export const getRecipesIds = (state: AppState) => getDeploy(state).recipes.allIds;
export const getRecipe = (state: AppState, id: string) => getDeploy(state).recipes.byId[id];

export const getPinnedRecipesIds = createSelector(
  (state: AppState) => getDeploy(state).recipes,
  (recipes) => recipes.allIds.filter(id => recipes.byId[id].pinned)
);

export const getRunsIds = (state: AppState) => getDeploy(state).runs.allIds;
export const getRun = (state: AppState, id: string) => getDeploy(state).runs.byId[id];