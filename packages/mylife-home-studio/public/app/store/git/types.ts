import { GitStatus, GitDiff, GitDiffFile, diff, DEFAULT_STATUS } from '../../../../shared/git';
import { Table } from '../common/types';

export const enum ActionTypes {
  SET_NOTIFICATION = 'git/set-notification',
  CLEAR_NOTIFICATION = 'git/clear-notification',
  SET_STATUS = 'git/set-status',
  REFRESH = 'git/refresh',
  COMMIT = 'git/commit',
  DIFF = 'git/diff',
  DIFF_DATA_SET = 'git/diff-data-set',
  DIFF_DATA_CLEAR = 'git/diff-data-clear',
  DIFF_STAGE = 'git/diff-stage',
}

export namespace ActionPayloads {
  export type SetNotification = string;
  export type ClearNotification = void;
  export type SetStatus = GitStatus;
  export type GitCommit = { message: string };
  export type GitDiffDataSet = GitDiff;
  export type GitDiffDataClear = void;
  export type GitDiffStage = { type: 'feature' | 'file' | 'all'; id?: string; stage: boolean };
}

export { GitStatus, GitDiff, GitDiffFile, diff, DEFAULT_STATUS };

export interface Feature {
  id: string;
  files: string[];
}

export interface File extends Omit<diff.File, 'chunks'> {
  id: string;
  name: string;
  chunks: string[];
  staged: boolean;
}

export interface Chunk extends diff.Chunk {
  id: string;
}

export interface GitState {
  notifierId: string;
  status: GitStatus;

  // filled when we have diff data
  features: Table<Feature>;
  files: Table<File>;
  chunks: Table<Chunk>;
}