import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';

const getGit = (state: AppState) => state.git;
export const getNotifierId = (state: AppState) => getGit(state).notifierId;
const getStatus = (state: AppState) => getGit(state).status;

export const getGitBranch = (state: AppState) => getStatus(state).branch;
export const getGitChangedFeatures = (state: AppState) => getStatus(state).changedFeatures;
export const getGitAppUrl = (state: AppState) => getStatus(state).appUrl;
export const getGitCommitsCount = createSelector(getStatus, (status) => ({ ahead: status.ahead, behind: status.behind }));

const getGitDiffFeaturesTable = (state: AppState) => getGit(state).features;
const getGitDiffFilesTable = (state: AppState) => getGit(state).files;
export const getGitDiffFeatures = (state: AppState) => getGitDiffFeaturesTable(state).allIds;
export const getGitDiffFeature = (state: AppState, id: string) => getGitDiffFeaturesTable(state).byId[id];
export const getGitDiffFile = (state: AppState, id: string) => getGitDiffFilesTable(state).byId[id];
export const getGitDiffChunk = (state: AppState, id: string) => getGit(state).chunks.byId[id];

export function makeGetGitStagingFeatures() {
  return createSelector(
    getGitDiffFeaturesTable,
    getGitDiffFilesTable,
    (state: AppState, staged: boolean) => staged,
    (features, files, staged) => features.allIds.filter(featureId => {
      const feature = features.byId[featureId];

      for (const fileId of feature.files) {
        const file = files.byId[fileId];
        if (file.staged === staged) {
          return true;
        }
      }

      return false;
    })
  );
}

export function makeGetGitStagingFiles() {
  return createSelector(
    getGitDiffFeature,
    getGitDiffFilesTable,
    (state: AppState, featureId: string, staged: boolean) => staged,
    (feature, files, staged) => feature.files.filter(fileId => {
      const file = files.byId[fileId];
      return file.staged === staged;
    })
  );
}
