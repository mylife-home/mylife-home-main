import { createNotifierEpic } from '../common/notifier-epic';
import { setNotification, clearNotification, setStatus } from './actions';
import { getNotifierId } from './selectors';
import { Status } from './types';

export default createNotifierEpic({
  notificationType: 'online/status',
  startNotifierService: 'online/start-notify-status',
  stopNotifierService: 'online/stop-notify-status',
  getNotifierId,
  hasTypedTab: () => true, // on status bar, always present
  setNotification,
  clearNotification,
  applyUpdates,
  parseUpdate,
});

function applyUpdates(updates: Status[]) {
  // Only the last one is relevant anyway
  const update = updates.pop();
  return setStatus(update);
}

function parseUpdate(update: Status): Status {
  return update;
}
