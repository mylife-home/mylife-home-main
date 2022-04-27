import { GitStatus, GitDiff, DEFAULT_STATUS } from '../../../../shared/git';

export const enum ActionTypes {
  SET_NOTIFICATION = 'git/set-notification',
  CLEAR_NOTIFICATION = 'git/clear-notification',
  SET_STATUS = 'git/set-status',
  REFRESH = 'git/refresh',
  DIFF = 'git/diff'
}

export { GitStatus, GitDiff, DEFAULT_STATUS };

export interface GitState {
  notifierId: string;
  status: GitStatus;
}