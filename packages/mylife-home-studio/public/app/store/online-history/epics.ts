import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import { HistoryRecord } from '../../../../shared/online';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { setNotification, clearNotification, addHistoryItems } from './actions';
import { hasOnlineHistoryTab, getNotifierId } from './selectors';
import { bufferDebounceTime, filterNotification, handleError, withSelector } from '../common/rx-operators';
import { HistoryItem } from './types';

const startNotifyHistoryEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
  filterNotifyChange(state$),
  withSelector(state$, getNotifierId),
  filter(([, notifierId]) => !notifierId),
  mergeMap(() => startCall().pipe(
    map(({ notifierId }) => setNotification(notifierId)),
    handleError()
  ))
);

const stopNotifyHistoryEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
  filterNotifyChange(state$),
  withSelector(state$, getNotifierId),
  filter(([, notifierId]) => !!notifierId),
  mergeMap(([, notifierId]) => stopCall({ notifierId }).pipe(
    map(() => clearNotification()),
    handleError()
  ))
);

const fetchHistoryEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  const notification$ = socket.notifications();
  return notification$.pipe(
    filterNotification('online/history'),
    withSelector(state$, getNotifierId),
    filter(([notification, notifierId]) => notification.notifierId === notifierId),
    map(([notification]) => parseHistoryRecord(notification.data)),
    bufferDebounceTime(100), // debounce to avoid multiple store updates
    map((items) => addHistoryItems(items)),
  );
};

export default combineEpics(startNotifyHistoryEpic, stopNotifyHistoryEpic, fetchHistoryEpic);

function filterNotifyChange(state$: StateObservable<AppState>) {
  return (source: Observable<Action>) => source.pipe(
    ofType(TabActionTypes.NEW, TabActionTypes.CLOSE),
    withLatestFrom(state$),
    filter(([, state]) => {
      const hasTab = hasOnlineHistoryTab(state);
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

function parseHistoryRecord(record: HistoryRecord): HistoryItem {
  const { timestamp, ...data } = record;
  return { ...data, id: `${++idGenerator}`, timestamp: new Date(record.timestamp) };
}
