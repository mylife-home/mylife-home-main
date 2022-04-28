import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { arrayAdd, createTable, tableClear, tableSet } from '../common/reducer-tools';
import { GitState, ActionTypes, GitStatus, DEFAULT_STATUS, GitDiff, Feature, File, Chunk, GitDiffFile, diff } from './types';

const initialState: GitState = {
  notifierId: null,
  status: DEFAULT_STATUS,
  features: createTable<Feature>(),
  files: createTable<File>(),
  chunks: createTable<Chunk>(),
};

export default createReducer(initialState, {
  [ActionTypes.SET_NOTIFICATION]: (state, action: PayloadAction<string>) => {
    state.notifierId = action.payload;
  },

  [ActionTypes.CLEAR_NOTIFICATION]: (state) => {
    state.notifierId = null;
    state.status = DEFAULT_STATUS;
  },

  [ActionTypes.SET_STATUS]: (state, action: PayloadAction<GitStatus>) => {
    state.status = action.payload;
  },

  [ActionTypes.DIFF_DATA_SET]: (state, action: PayloadAction<GitDiff>) => {
    for (const id of state.status.changedFeatures) {
      const feature: Feature = { id, files: [] };
      tableSet(state.features, feature, true);
    }

    for (const file of action.payload.files) {
      const id = createFile(state, file);
      const feature = state.features.byId[file.feature];
      arrayAdd(feature.files, id, true);
    }
  },

  [ActionTypes.DIFF_DATA_CLEAR]: (state) => {
    tableClear(state.features);
    tableClear(state.files);
    tableClear(state.chunks);
  },
});

function createFile(state: GitState, file: GitDiffFile) {
  const fileId = file.to || file.from;
  const { feature, chunks, ...props } = file;
  const parts = fileId.split('/');
  const name = parts[parts.length - 1];
  const newFile: File = { id: fileId, name, chunks: [], ...props };
  tableSet(state.files, newFile);

  for (const [index, chunk] of chunks.entries()) {
    const chunkId = `${fileId}/${index}`;
    createChunk(state, chunkId, chunk);
    newFile.chunks.push(chunkId);
  }

  return fileId;
}

function createChunk(state: GitState, id: string, chunk: diff.Chunk) {
  const newChunk: Chunk = { id, ...chunk };
  tableSet(state.chunks, newChunk);
  return id;
}