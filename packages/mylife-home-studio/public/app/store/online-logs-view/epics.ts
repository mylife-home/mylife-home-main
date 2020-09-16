import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import { LogRecord } from '../../../../shared/logging';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { setNotification, clearNotification, addLogItems } from './actions';
import { hasOnlineLogsViewTab, getNotifierId } from './selectors';
import { bufferDebounceTime, filterNotification, handleError, withSelector } from '../common/rx-operators';
import { LogItem } from './types';

const startNotifyLogsEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
  filterNotifyChange(state$),
  withSelector(state$, getNotifierId),
  filter(([, notifierId]) => !notifierId),
  mergeMap(() => startCall().pipe(
    map(({ notifierId }) => setNotification(notifierId)),
    handleError()
  ))
);

const stopNotifyLogsEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
  filterNotifyChange(state$),
  withSelector(state$, getNotifierId),
  filter(([, notifierId]) => !!notifierId),
  mergeMap(([, notifierId]) => stopCall({ notifierId }).pipe(
    map(() => clearNotification()),
    handleError()
  ))
);

const fetchLogsEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  const notification$ = socket.notifications();
  return notification$.pipe(
    filterNotification('logging/logs'),
    withSelector(state$, getNotifierId),
    filter(([notification, notifierId]) => notification.notifierId === notifierId),
    map(([notification]) => parseLogRecord(notification.data)),
    bufferDebounceTime(100), // debounce to avoid multiple store updates
    map((items) => addLogItems(items)),
  );
};

export default combineEpics(startNotifyLogsEpic, stopNotifyLogsEpic, fetchLogsEpic);

function filterNotifyChange(state$: StateObservable<AppState>) {
  return (source: Observable<Action>) => source.pipe(
    ofType(TabActionTypes.NEW, TabActionTypes.CLOSE),
    withLatestFrom(state$),
    filter(([, state]) => {
      const hasTab = hasOnlineLogsViewTab(state);
      const hasNotifications = !!getNotifierId(state);
      return xor(hasTab, hasNotifications);
    }),
    map(([action]) => action)
  );
}

function xor(a: boolean, b: boolean) {
  return a && !b || !a && b;
}

function startCall() {
  return socket.call('logging/start-notify-logs', null) as Observable<{ notifierId: string; }>;
}

function stopCall({ notifierId }: { notifierId: string; }) {
  return socket.call('logging/stop-notify-logs', { notifierId }) as Observable<void>;
}

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
