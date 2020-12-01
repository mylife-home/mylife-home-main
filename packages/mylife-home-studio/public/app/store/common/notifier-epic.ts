import { Action } from 'redux';
import { Observable, from } from 'rxjs';
import { filter, map, mergeMap, concatMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { bufferDebounceTime, filterNotification, handleError, withSelector } from './rx-operators';
import { ActionTypes as TabActionTypes } from '../tabs/types';

interface Parameters<TUpdateData, TUpdate> {
  // defines
  notificationType: string;
  startNotifierService: string;
  stopNotifierService: string;

  // selectors
  getNotifierId: (state: AppState) => string;
  hasTab: (state: AppState) => boolean;

  // action creators
  setNotification: (notifierId: string) => Action;
  clearNotification: () => Action;
  applyUpdates: (updates: TUpdate[]) => Action;

  // parse
  parseUpdates: (updateData: TUpdateData) => TUpdate | TUpdate[];
}

// notifier for all tabs (created on first tab of type open, deleted on last tab of type close)
export function createNotifierEpic<TUpdateData, TUpdate>({ notificationType, startNotifierService, stopNotifierService, getNotifierId, hasTab, setNotification, clearNotification, applyUpdates, parseUpdates }: Parameters<TUpdateNetData, TUpdate>) {
  const startNotifyComponentsEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
    filterNotifyChange(state$),
    withSelector(state$, getNotifierId),
    filter(([, notifierId]) => !notifierId),
    mergeMap(() => startCall().pipe(
      map(({ notifierId }) => setNotification(notifierId)),
      handleError()
    ))
  );

  const stopNotifyComponentsEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
    filterNotifyChange(state$),
    withSelector(state$, getNotifierId),
    filter(([, notifierId]) => !!notifierId),
    mergeMap(([, notifierId]) => stopCall({ notifierId }).pipe(
      map(() => clearNotification()),
      handleError()
    ))
  );

  const fetchComponentsEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
    const notification$ = socket.notifications();
    return notification$.pipe(
      filterNotification(notificationType),
      withSelector(state$, getNotifierId),
      filter(([notification, notifierId]) => notification.notifierId === notifierId),
      concatMap(([notification]) => streamParseUpdates(notification.data)),
      bufferDebounceTime(100), // debounce to avoid multiple store updates
      map((items) => applyUpdates(items)),
    );
  };

  return combineEpics(startNotifyComponentsEpic, stopNotifyComponentsEpic, fetchComponentsEpic);

  function filterNotifyChange(state$: StateObservable<AppState>) {
    return (source: Observable<Action>) => source.pipe(
      ofType(TabActionTypes.NEW, TabActionTypes.CLOSE),
      withLatestFrom(state$),
      filter(([, state]) => {
        const hasTabValue = hasTab(state);
        const hasNotifications = !!getNotifierId(state);
        return xor(hasTabValue, hasNotifications);
      }),
      map(([action]) => action)
    );
  }

  function xor(a: boolean, b: boolean) {
    return a && !b || !a && b;
  }

  function startCall() {
    return socket.call(startNotifierService, null) as Observable<{ notifierId: string; }>;
  }

  function stopCall({ notifierId }: { notifierId: string; }) {
    return socket.call(stopNotifierService, { notifierId }) as Observable<void>;
  }

  function streamParseUpdates(updateData: TUpdateData) {
    const singleOrArray = parseUpdates(updateData);
    const items = Array.isArray(singleOrArray) ? singleOrArray : [singleOrArray];
    return from(items);
  }
}
