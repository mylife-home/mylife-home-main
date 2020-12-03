import { Action } from 'redux';
import { Observable, from } from 'rxjs';
import { filter, map, mergeMap, concatMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { bufferDebounceTime, filterNotification, handleError, withSelector, filterFromState } from './rx-operators';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { ActionTypes as StatusActionTypes } from '../status/types';
import { isOnline } from '../status/selectors';

interface Parameters<TUpdateData, TUpdate> {
  // defines
  notificationType: string;
  startNotifierService: string;
  stopNotifierService: string;

  // selectors
  getNotifierId: (state: AppState) => string;
  hasTypedTab: (state: AppState) => boolean;

  // action creators
  setNotification: (notifierId: string) => Action;
  clearNotification: () => Action;
  applyUpdates: (updates: TUpdate[]) => Action;

  // parse
  parseUpdate: (updateData: TUpdateData) => TUpdate | TUpdate[];
}

type ActionTypes = TabActionTypes | StatusActionTypes;

// notifier for all tabs (created on first tab of type open, deleted on last tab of type close)
export function createNotifierEpic<TUpdateData, TUpdate>({ notificationType, startNotifierService, stopNotifierService, getNotifierId, hasTypedTab, setNotification, clearNotification, applyUpdates, parseUpdate }: Parameters<TUpdateData, TUpdate>) {
  const startNotifyEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
    ofType(TabActionTypes.NEW as ActionTypes, StatusActionTypes.ONLINE as ActionTypes),
    filterFromState(state$, state => {
      const hasTab = hasTypedTab(state);
      const online = isOnline(state);
      const shouldHaveNotifications = hasTab && online;
      const hasNotifications = !!getNotifierId(state);
      return shouldHaveNotifications && !hasNotifications;
    }),
    mergeMap(() => startCall().pipe(
      map(({ notifierId }) => setNotification(notifierId)),
      handleError()
    ))
  );

  const stopNotifyEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
    ofType(TabActionTypes.CLOSE),
    filterFromState(state$, state => {
      // if we have a notifierId then we are online
      const hasTab = hasTypedTab(state);
      const shouldHaveNotifications = hasTab;
      const hasNotifications = !!getNotifierId(state);
      return !shouldHaveNotifications && hasNotifications;
    }),
    withSelector(state$, getNotifierId),
    filter(([, notifierId]) => !!notifierId),
    mergeMap(([, notifierId]) => stopCall({ notifierId }).pipe(
      map(() => clearNotification()),
      handleError()
    ))
  );

  const clearNotifyEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
    ofType(StatusActionTypes.ONLINE),
    filterFromState(state$, state => {
      const online = isOnline(state);
      const hasNotifications = !!getNotifierId(state);
      return !online && hasNotifications;
    }),
    withSelector(state$, getNotifierId),
    filter(([, notifierId]) => !!notifierId),
    map(() => clearNotification()),
  );

  const fetchEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
    const notification$ = socket.notifications();
    return notification$.pipe(
      filterNotification(notificationType),
      withSelector(state$, getNotifierId),
      filter(([notification, notifierId]) => notification.notifierId === notifierId),
      concatMap(([notification]) => streamParseUpdate(notification.data)),
      bufferDebounceTime(100), // debounce to avoid multiple store updates
      map((items) => applyUpdates(items)),
    );
  };

  return combineEpics(startNotifyEpic, stopNotifyEpic, clearNotifyEpic, fetchEpic);

  function startCall() {
    return socket.call(startNotifierService, null) as Observable<{ notifierId: string; }>;
  }

  function stopCall({ notifierId }: { notifierId: string; }) {
    return socket.call(stopNotifierService, { notifierId }) as Observable<void>;
  }

  function streamParseUpdate(updateData: TUpdateData) {
    const singleOrArray = parseUpdate(updateData);
    const items = Array.isArray(singleOrArray) ? singleOrArray : [singleOrArray];
    return from(items);
  }
}
