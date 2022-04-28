import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';

const getGit = (state: AppState) => state.git;
export const getNotifierId = (state: AppState) => getGit(state).notifierId;
const getStatus = (state: AppState) => getGit(state).status;

export const getGitBranch = (state: AppState) => getStatus(state).branch;
export const getGitChangedFeatures = (state: AppState) => getStatus(state).changedFeatures;
export const getGitAppUrl = (state: AppState) => getStatus(state).appUrl;
export const getGitCommitsCount = createSelector(getStatus, (status) => ({ ahead: status.ahead, behind: status.behind }));

export const getGitDiffFeatures = (state: AppState) => getGit(state).features.allIds;
export const getGitDiffFeature = (state: AppState, id: string) => getGit(state).features.byId[id];
export const getGitDiffFile = (state: AppState, id: string) => getGit(state).files.byId[id];
export const getGitDiffChunk = (state: AppState, id: string) => getGit(state).chunks.byId[id];