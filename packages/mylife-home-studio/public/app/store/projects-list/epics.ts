import { createNotifierEpic } from '../common/notifier-epic';
import { setNotification, clearNotification, pushUpdates } from './actions';
import { getNotifierId, hasStartPageTab } from './selectors';
import { Update } from './types';

export default createNotifierEpic({
  notificationType: 'project-manager/list',
  startNotifierService: 'project-manager/start-notify-list',
  stopNotifierService: 'project-manager/stop-notify-list',
  getNotifierId,
  hasTypedTab: hasStartPageTab,
  setNotification,
  clearNotification,
  applyUpdates: pushUpdates,
  parseUpdate: parseUpdate,
});

function parseUpdate(record: unknown): Update {
  return {
    // TODO
  };
}
