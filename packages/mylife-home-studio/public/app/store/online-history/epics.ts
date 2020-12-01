import { ComponentSetHistoryRecord, HistoryRecord, StateHistoryRecord } from '../../../../shared/online';
import { setNotification, clearNotification, addHistoryItems } from './actions';
import { hasOnlineHistoryTab, getNotifierId } from './selectors';
import { HistoryItem, StateHistoryItem, ComponentHistoryItem } from './types';
import { createNotifierEpic } from '../common/notifier-epic';

export default createNotifierEpic({
  notificationType: 'online/history',
  startNotifierService: 'online/start-notify-history',
  stopNotifierService: 'online/stop-notify-history',
  getNotifierId,
  hasTypedTab: hasOnlineHistoryTab,
  setNotification,
  clearNotification,
  applyUpdates: addHistoryItems,
  parseUpdate: parseHistoryRecord,
});

let idGenerator = 0;

function parseHistoryRecord(record: HistoryRecord): HistoryItem[] {
  switch (record.type) {
    case 'component-set': {
      const { timestamp, states, ...data } = record as ComponentSetHistoryRecord;
      const result: HistoryItem[] = [];

      result.push({ ...data, id: `${++idGenerator}`, timestamp: new Date(record.timestamp) } as ComponentHistoryItem);
      for (const [stateName, stateValue] of Object.entries(states)) {
        result.push({
          id: `${++idGenerator}`,
          timestamp: new Date(record.timestamp),
          type: 'state-set',
          instanceName: data.instanceName,
          componentId: data.componentId,
          stateName, stateValue,
          initial: true
        } as StateHistoryItem);
      }

      return result;
    }

    case 'state-set': {
      const { timestamp, ...data } = record as StateHistoryRecord;
      return [{ ...data, id: `${++idGenerator}`, timestamp: new Date(record.timestamp), initial: false } as StateHistoryItem];
    }

    default: {
      const { timestamp, ...data } = record;
      return [{ ...data, id: `${++idGenerator}`, timestamp: new Date(record.timestamp) }];
    }
  }
}
