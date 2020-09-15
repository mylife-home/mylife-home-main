import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { setNotification, clearNotification, addRecords } from './actions';
import { hasOnlineLogsViewTab, getNotifierId } from './selectors';
import { bufferDebounceTime, handleError, withSelector } from '../common/rx-operators';
import { LogRecord } from './types';

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
    withSelector(state$, getNotifierId),
    filter(([notification, notifierId]) => notification.notifierType === 'logging/logs' && notification.notifierId === notifierId),
    map(([notification]) => notification.data as LogRecord),
    bufferDebounceTime(100), // debounce to avoid multiple store updates
    map((records) => addRecords(records)),
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