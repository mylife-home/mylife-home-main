export const DEFAULT_STATUS: GitStatus = {
  branch: '<unknown>',
  changedFeatures: {},
};

export interface GitStatus {
  branch: string;
  changedFeatures: { [featureName: string]: string[] };
}

export interface GitStatusNotification {
  status: GitStatus;
}