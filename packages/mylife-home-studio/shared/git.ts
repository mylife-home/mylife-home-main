import parseDiff from 'parse-diff';

export namespace diff {
  export type File = parseDiff.File;
  export type Chunk = parseDiff.Chunk;
  export type NormalChange = parseDiff.NormalChange;
  export type AddChange = parseDiff.AddChange;
  export type DeleteChange = parseDiff.DeleteChange;
  export type ChangeType = parseDiff.ChangeType;
  export type Change = parseDiff.Change;
}

export const DEFAULT_STATUS: GitStatus = {
  appUrl: null,
  branch: '<unknown>',
  changedFeatures: [],
  ahead: null,
  behind: null,
};

export interface GitStatus {
  appUrl: string;
  branch: string;
  changedFeatures: string[];
  ahead: number;
  behind: number;
}

export interface GitStatusNotification {
  status: GitStatus;
}

export type GitDiffFile = diff.File & { feature: string; };

export interface GitDiff {
  files: GitDiffFile[];
}

export interface GitCommit {
  message: string;
  files: string[];
}