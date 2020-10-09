import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import { LogRecord } from '../../../../shared/logging';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { setNotification, clearNotification, setInstance, clearInstance } from './actions';
import { hasOnlineInstancesViewTab, getNotifierId } from './selectors';
import { bufferDebounceTime, filterNotification, handleError, withSelector } from '../common/rx-operators';
import { InstanceInfo } from './types';

const startNotifyInstancesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
  filterNotifyChange(state$),
  withSelector(state$, getNotifierId),
  filter(([, notifierId]) => !notifierId),
  mergeMap(() => startCall().pipe(
    map(({ notifierId }) => setNotification(notifierId)),
    handleError()
  ))
);

const stopNotifyInstancesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
  filterNotifyChange(state$),
  withSelector(state$, getNotifierId),
  filter(([, notifierId]) => !!notifierId),
  mergeMap(([, notifierId]) => stopCall({ notifierId }).pipe(
    map(() => clearNotification()),
    handleError()
  ))
);

const fetchInstancesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  const notification$ = socket.notifications();
  return notification$.pipe(
    filterNotification('online/instance-info'),
    withSelector(state$, getNotifierId),
    filter(([notification, notifierId]) => notification.notifierId === notifierId),
    map(([notification]) => parseLogRecord(notification.data)),
    bufferDebounceTime(100), // debounce to avoid multiple store updates
    map((items) => addLogItems(items)),
  );
};

export default combineEpics(startNotifyInstancesEpic, stopNotifyInstancesEpic, fetchInstancesEpic);

function filterNotifyChange(state$: StateObservable<AppState>) {
  return (source: Observable<Action>) => source.pipe(
    ofType(TabActionTypes.NEW, TabActionTypes.CLOSE),
    withLatestFrom(state$),
    filter(([, state]) => {
      const hasTab = hasOnlineInstancesViewTab(state);
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
  return socket.call('online/start-notify-instance-info', null) as Observable<{ notifierId: string; }>;
}

function stopCall({ notifierId }: { notifierId: string; }) {
  return socket.call('online/stop-notify-instance-info', { notifierId }) as Observable<void>;
}

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
