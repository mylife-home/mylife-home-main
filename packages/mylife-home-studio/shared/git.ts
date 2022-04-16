export const DEFAULT_STATUS: GitStatus = {
  appUrl: null,
  branch: '<unknown>',
  changedFeatures: {},
};

export type GitChangedFeatures = { [featureName: string]: string[] };

export interface GitStatus {
  appUrl: string;
  branch: string;
  changedFeatures: GitChangedFeatures;
}

export interface GitStatusNotification {
  status: GitStatus;
}