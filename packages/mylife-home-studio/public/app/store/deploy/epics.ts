import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import { UpdateDataNotification } from '../../../../shared/deploy';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { setNotification, clearNotification, pushUpdates } from './actions';
import { hasDeployTab, getNotifierId } from './selectors';
import { bufferDebounceTime, filterNotification, handleError, withSelector } from '../common/rx-operators';
import { Update } from './types';

const startNotifyUpdatesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
  filterNotifyChange(state$),
  withSelector(state$, getNotifierId),
  filter(([, notifierId]) => !notifierId),
  mergeMap(() => startCall().pipe(
    map(({ notifierId }) => setNotification(notifierId)),
    handleError()
  ))
);

const stopNotifyUpdatesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
  filterNotifyChange(state$),
  withSelector(state$, getNotifierId),
  filter(([, notifierId]) => !!notifierId),
  mergeMap(([, notifierId]) => stopCall({ notifierId }).pipe(
    map(() => clearNotification()),
    handleError()
  ))
);

const fetchUpdatesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  const notification$ = socket.notifications();
  return notification$.pipe(
    filterNotification('deploy/updates'),
    withSelector(state$, getNotifierId),
    filter(([notification, notifierId]) => notification.notifierId === notifierId),
    map(([notification]) => parseNotification(notification.data)),
    bufferDebounceTime(100), // debounce to avoid multiple store updates
    map((items) => pushUpdates(items)),
  );
};

export default combineEpics(startNotifyUpdatesEpic, stopNotifyUpdatesEpic, fetchUpdatesEpic);

function filterNotifyChange(state$: StateObservable<AppState>) {
  return (source: Observable<Action>) => source.pipe(
    ofType(TabActionTypes.NEW, TabActionTypes.CLOSE),
    withLatestFrom(state$),
    filter(([, state]) => {
      const hasTab = hasDeployTab(state);
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
  return socket.call('deploy/start-notify', null) as Observable<{ notifierId: string; }>;
}

function stopCall({ notifierId }: { notifierId: string; }) {
  return socket.call('deploy/stop-notify', { notifierId }) as Observable<void>;
}

function parseNotification(notification: UpdateDataNotification): Update {
  // TODO;
  return null;
}
