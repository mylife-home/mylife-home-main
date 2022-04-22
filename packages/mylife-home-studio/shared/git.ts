export const DEFAULT_STATUS: GitStatus = {
  appUrl: null,
  branch: '<unknown>',
  changedFeatures: {},
  ahead: null,
  behind: null,
};

export type GitChangedFeatures = { [featureName: string]: string[] };

export interface GitStatus {
  appUrl: string;
  branch: string;
  changedFeatures: GitChangedFeatures;
  ahead: number;
  behind: number;
}

export interface GitStatusNotification {
  status: GitStatus;
}