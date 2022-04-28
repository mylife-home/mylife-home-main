import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GitStatusNotification } from '../../../../shared/git';
import { createSocketCallEpic } from '../common/call-epic';
import { createNotifierEpic } from '../common/notifier-epic';
import { setNotification, clearNotification, setStatus, gitDiffDataSet } from './actions';
import { getNotifierId } from './selectors';
import { ActionTypes, GitStatus, GitDiff } from './types';

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
const diffEpic = createSocketCallEpic<ActionTypes, GitDiff>(ActionTypes.DIFF, 'git/diff', undefined, undefined, gitDiffResultProcessor());

export default combineEpics(notifierEpic, refreshEpic, diffEpic);

function applyUpdates(updates: GitStatus[]) {
  // Only the last one is relevant anyway
  const update = updates.pop();
  return setStatus(update);
}

function parseUpdate(update: GitStatusNotification): GitStatus {
  return update.status;
}

function gitDiffResultProcessor() {
  return ($source: Observable<GitDiff>) => $source.pipe(
    map((result: GitDiff) => gitDiffDataSet(result))
  );
}