
export interface GitStatus {
  branch: string;
  changedFeatures: string[];
}

export interface GitStatusNotification {
  status: GitStatus;
}