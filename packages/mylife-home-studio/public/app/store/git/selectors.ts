import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';

const getGit = (state: AppState) => state.git;
export const getNotifierId = (state: AppState) => getGit(state).notifierId;
const getStatus = (state: AppState) => getGit(state).status;

export const getGitBranch = (state: AppState) => getStatus(state).branch;
export const getGitChangedFeatures = createSelector(getStatus, (status) => Object.keys(status.changedFeatures).sort());
export const getGitChangedFiles = (state: AppState) => getStatus(state).changedFeatures;
export const getGitAppUrl = (state: AppState) => getStatus(state).appUrl;
export const getGitCommitsCount = createSelector(getStatus, (status) => ({ ahead: status.ahead, behind: status.behind }));