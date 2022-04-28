import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GitStatusNotification, GitCommit } from '../../../../shared/git';
import { DeferredPayload } from '../common/async-action';
import { createSocketCallEpic } from '../common/call-epic';
import { createNotifierEpic } from '../common/notifier-epic';
import { AppState } from '../types';
import { setNotification, clearNotification, setStatus, gitDiffDataSet } from './actions';
import { getNotifierId, getGitDiffStagingFiles } from './selectors';
import { ActionTypes, ActionPayloads, GitStatus, GitDiff } from './types';

const notifierEpic = createNotifierEpic({
  notificationType: 'git/status',
  startNotifierService: 'git/start-notify',
  stopNotifierService: 'git/stop-notify',
  getNotifierId,
  hasTypedTab: () => true, // on status bar, always present
  setNotification,
  clearNotification,
  applyUpdates,
  parseUpdate,
});

const refreshEpic = createSocketCallEpic(ActionTypes.REFRESH, 'git/refresh');
const commitEpic = createSocketCallEpic(ActionTypes.COMMIT, 'git/commit', gitCommitMapper);
const diffEpic = createSocketCallEpic<ActionTypes, GitDiff>(ActionTypes.DIFF, 'git/diff', undefined, undefined, gitDiffResultProcessor());

export default combineEpics(notifierEpic, refreshEpic, commitEpic, diffEpic);

function applyUpdates(updates: GitStatus[]) {
  // Only the last one is relevant anyway
  const update = updates.pop();
  return setStatus(update);
}

function parseUpdate(update: GitStatusNotification): GitStatus {
  return update.status;
}

function gitCommitMapper(payload: ActionPayloads.GitCommit & DeferredPayload<void>, state: AppState): GitCommit {
  return {
    message: payload.message,
    files: getGitDiffStagingFiles(state),
  };
}

function gitDiffResultProcessor() {
  return ($source: Observable<GitDiff>) => $source.pipe(
    map((result: GitDiff) => gitDiffDataSet(result))
  );
}