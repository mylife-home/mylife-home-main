
export interface GitStatus {
  branch: string;
  changedFeatures: { [featureName: string]: string[] };
}

export interface GitStatusNotification {
  status: GitStatus;
}