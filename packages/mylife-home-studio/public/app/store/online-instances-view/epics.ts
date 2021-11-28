import { combineEpics } from 'redux-observable';

import * as shared from '../../../../shared/online';
import { setNotification, clearNotification, pushUpdates } from './actions';
import { hasOnlineInstancesViewTab, getNotifierId } from './selectors';
import { ActionTypes, Update, SetUpdate, ClearUpdate } from './types';
import { createNotifierEpic } from '../common/notifier-epic';
import { createSocketCallEpic } from '../common/call-epic';

const notifierEpic = createNotifierEpic({
  notificationType: 'online/instance-info',
  startNotifierService: 'online/start-notify-instance-info',
  stopNotifierService: 'online/stop-notify-instance-info',
  getNotifierId,
  hasTypedTab: hasOnlineInstancesViewTab,
  setNotification,
  clearNotification,
  applyUpdates: pushUpdates,
  parseUpdate: parseUpdate,
});

const executeSystemRestart = createSocketCallEpic(ActionTypes.EXECUTE_SYSTEM_RESTART, 'online/execute-system-restart');

export default combineEpics(notifierEpic, executeSystemRestart);

function parseUpdate(updateData: shared.UpdateInstanceInfoData): Update {
  switch (updateData.operation) {
    case 'set': {
      return { type: 'set', instanceName: updateData.instanceName, data: updateData.data } as SetUpdate;
    }
    
    case 'clear':
      return { type: 'clear', instanceName: updateData.instanceName } as ClearUpdate;

    default:
      throw new Error(`Unsupported server operation: ${updateData.operation}`);
  }
}
