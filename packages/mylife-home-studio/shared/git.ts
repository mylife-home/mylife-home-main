export const DEFAULT_STATUS: GitStatus = {
  appUrl: null,
  branch: '<unknown>',
  changedFeatures: {},
};

export interface GitStatus {
  appUrl: string;
  branch: string;
  changedFeatures: { [featureName: string]: string[] };
}

export interface GitStatusNotification {
  status: GitStatus;
}