import { LogRecord } from '../../../../shared/logging';
import { createNotifierEpic } from '../common/notifier-epic';
import { setNotification, clearNotification, addLogItems } from './actions';
import { hasOnlineLogsTab, getNotifierId } from './selectors';
import { LogItem } from './types';

export default createNotifierEpic({
  notificationType: 'logging/logs',
  startNotifierService: 'logging/start-notify-logs',
  stopNotifierService: 'logging/stop-notify-logs',
  getNotifierId,
  hasTypedTab: hasOnlineLogsTab,
  setNotification,
  clearNotification,
  applyUpdates: addLogItems,
  parseUpdate: parseLogRecord,
});

let idGenerator = 0;

function parseLogRecord(record: LogRecord): LogItem {
  return {
    id: `${++idGenerator}`,
    name: record.name,
    instanceName: record.instanceName,
    hostname: record.hostname,
    pid: record.pid,
    level: record.level,
    msg: record.msg,
    time: new Date(record.time),
    err: record.err || null,
  };
}
