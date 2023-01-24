import { Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { Observable } from 'rxjs';
import { tap, withLatestFrom, ignoreElements } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';
import { createObjectCsvStringifier } from 'csv-writer-browser';
import { LogRecord } from '../../../../shared/logging';
import { createNotifierEpic } from '../common/notifier-epic';
import { setNotification, clearNotification, addLogItems } from './actions';
import { hasOnlineLogsTab, getNotifierId, getItems } from './selectors';
import { AppState } from '../types';
import { ActionTypes, LogItem } from './types';

const notifierEpic = createNotifierEpic({
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


const downloadFileEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.DOWNLOAD_FILE),
    withLatestFrom(state$),
    tap(([action, state]: [PayloadAction<{ type: 'csv' | 'jsonl' }>, AppState]) => handleDownload(action.payload.type, getItems(state))),
    ignoreElements()
  );

export default combineEpics(notifierEpic, downloadFileEpic);

const formatters = {
  csv(items: LogItem[]) {
    const writer = createObjectCsvStringifier({
      header: ['id', 'time', 'name', 'instanceName', 'hostname', 'pid', 'level', 'msg', 'err.message', 'err.name', 'err.stack']
    });

    const flatten = items.map(item => {
      const { time, err, ...rest } = item;
      return { 
        ...rest,
        time: time.toISOString(),
        'err.message': err?.message,
        'err.name': err?.name,
        'err.stack': err?.stack
      };
    });

    return writer.stringifyRecords(flatten);
  },

  jsonl(items: LogItem[]) {
    return items
      .map(item => JSON.stringify(item))
      .join('\n');
  }
}

function handleDownload(type: 'csv' | 'jsonl', items: LogItem[]) {
  const content = formatters[type](items);
  const blob = new Blob([content]);
  const name = `logs-${formatTimestamp(new Date())}.${type}`;
  downloadFile(blob, name);
}

function formatTimestamp(date: Date) {
  const year = str(date.getFullYear(), 4);
  const month = str(date.getMonth() + 1, 2);
  const day = str(date.getDate(), 2);
  const hours = str(date.getHours(), 2);
  const minutes = str(date.getMinutes(), 2);
  const seconds = str(date.getSeconds(), 2);
  return year + month + day + '-' + hours + minutes + seconds;

  function str(value: number, length: number) {
    return value.toString().padStart(length, '0');
  }
}

function downloadFile(blob: Blob, name: string) {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  const url = window.URL.createObjectURL(blob);
  try {
    a.href = url;
    a.download = name;
    a.click();
  } finally {
    window.URL.revokeObjectURL(url);
  }
}
