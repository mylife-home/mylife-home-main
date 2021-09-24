import { combineEpics } from 'redux-observable';

import * as shared from '../../../../shared/online';
import { Update, SetPluginUpdate, ClearPluginUpdate, SetComponentUpdate, ClearComponentUpdate, SetStateUpdate, ActionTypes } from './types';
import { setNotification, clearNotification, pushUpdates } from './actions';
import { hasOnlineComponentsViewTab, getNotifierId } from './selectors';
import { createNotifierEpic } from '../common/notifier-epic';
import { createSocketCallEpic } from '../common/call-epic';

const notifierEpic = createNotifierEpic({
  notificationType: 'online/component',
  startNotifierService: 'online/start-notify-component',
  stopNotifierService: 'online/stop-notify-component',
  getNotifierId,
  hasTypedTab: hasOnlineComponentsViewTab,
  setNotification,
  clearNotification,
  applyUpdates: pushUpdates,
  parseUpdate,
});

const executeComponentAction = createSocketCallEpic(ActionTypes.EXECUTE_COMPONENT_ACTION, 'online/execute-component-action');

export default combineEpics(notifierEpic, executeComponentAction);

function parseUpdate(updateData: shared.UpdateComponentData): Update {
  switch (`${updateData.type}-${updateData.operation}`) {
    case 'plugin-set': {
      const typedUpdate = updateData as shared.SetPluginData;
      return { type: 'set-plugin', instanceName: typedUpdate.instanceName, plugin: typedUpdate.data } as SetPluginUpdate;
    }

    case 'plugin-clear': {
      const typedUpdate = updateData as shared.ClearData;
      return { type: 'clear-plugin', instanceName: typedUpdate.instanceName, id: typedUpdate.id } as ClearPluginUpdate;
    }

    case 'component-set': {
      const typedUpdate = updateData as shared.SetComponentData;
      return { type: 'set-component', instanceName: typedUpdate.instanceName, component: typedUpdate.data } as SetComponentUpdate;
    }

    case 'component-clear': {
      const typedUpdate = updateData as shared.ClearData;
      return { type: 'clear-component', instanceName: typedUpdate.instanceName, id: typedUpdate.id } as ClearComponentUpdate;
    }

    case 'state-set': {
      const typedUpdate = updateData as shared.SetStateData;
      return { type: 'set-state', instanceName: typedUpdate.instanceName, ...typedUpdate.data } as SetStateUpdate;
    }

    default:
      throw new Error(`Unsupported server operation: ${updateData.type}-${updateData.operation}`);
  }
}
