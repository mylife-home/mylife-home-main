import * as shared from '../../../../shared/online';
import { setNotification, clearNotification, pushUpdates } from './actions';
import { hasOnlineInstancesViewTab, getNotifierId } from './selectors';
import { InstanceInfo, Update, SetUpdate, ClearUpdate } from './types';

import { createNotifierEpic } from '../common/notifier-epic';

export default createNotifierEpic({
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

function parseUpdate(updateData: shared.UpdateInstanceInfoData): Update {
  switch (updateData.operation) {
    case 'set': {
      const data = parseInstanceInfo(updateData.data);
      return { type: 'set', instanceName: updateData.instanceName, data } as SetUpdate;
    }
    
    case 'clear':
      return { type: 'clear', instanceName: updateData.instanceName } as ClearUpdate;

    default:
      throw new Error(`Unsupported server operation: ${updateData.operation}`);
  }
}

function parseInstanceInfo(raw: shared.InstanceInfo) : InstanceInfo {
  return {
    ...raw,
    systemBootTime: new Date(raw.systemBootTime),
    instanceBootTime: new Date(raw.instanceBootTime),
  };
}