import { createSelector } from '@reduxjs/toolkit';
import { Table } from '../common/types';
import { AppState } from '../types';
import { Feature, File } from './types';

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

export const hasGitDiffStaging = createSelector(
  getGitDiffFilesTable,
  (files) => Object.values(files.byId).some(file => file.staged)
);

export const getGitDiffStagingFiles = createSelector(
  getGitDiffFilesTable,
  (files) => (files.allIds).filter(id => files.byId[id].staged)
);

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

// with cache version
export function makeGetGitDiffDiscardFiles() {
  return createSelector(
    getGitDiffFeaturesTable,
    getGitDiffFilesTable,
    (state: AppState, type: 'all' | 'feature' | 'file', id?: string) => type,
    (state: AppState, type: 'all' | 'feature' | 'file', id?: string) => id,
    getGitDiffDiscardFilesImpl
  );
}

// without cache version
export const getGitDiffDiscardFiles = (state: AppState, type: 'all' | 'feature' | 'file', id?: string) => {
  const features = getGitDiffFeaturesTable(state);
  const files = getGitDiffFilesTable(state);
  return getGitDiffDiscardFilesImpl(features, files, type, id);
}

function getGitDiffDiscardFilesImpl(features: Table<Feature>, files: Table<File>, type: 'all' | 'feature' | 'file', id?: string) {
  // Discard only unstaged
  switch(type) {
    case 'all': {
      return files.allIds.filter(id => !files.byId[id].staged);
    }

    case 'feature': {
      const feature = features.byId[id];
      return feature.files.filter(id => !files.byId[id].staged);
    }

    case 'file': {
      return [id];
    }
  }
}