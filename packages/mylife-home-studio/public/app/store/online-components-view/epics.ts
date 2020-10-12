import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import * as shared from '../../../../shared/online';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { Plugin, Component, State } from './types';
import { setNotification, clearNotification, setPlugin, clearPlugin, setComponent, clearComponent, setState } from './actions';
import { hasOnlineComponentsViewTab, getNotifierId } from './selectors';
import { filterNotification, handleError, withSelector } from '../common/rx-operators';

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
    filterNotification('online/component'),
    withSelector(state$, getNotifierId),
    filter(([notification, notifierId]) => notification.notifierId === notifierId),
    map(([notification]) => parseUpdate(notification.data)),
  );
};

export default combineEpics(startNotifyComponentsEpic, stopNotifyComponentsEpic, fetchComponentsEpic);

function filterNotifyChange(state$: StateObservable<AppState>) {
  return (source: Observable<Action>) => source.pipe(
    ofType(TabActionTypes.NEW, TabActionTypes.CLOSE),
    withLatestFrom(state$),
    filter(([, state]) => {
      const hasTab = hasOnlineComponentsViewTab(state);
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
  return socket.call('online/start-notify-component', null) as Observable<{ notifierId: string; }>;
}

function stopCall({ notifierId }: { notifierId: string; }) {
  return socket.call('online/stop-notify-component', { notifierId }) as Observable<void>;
}

function parseUpdate(updateData: shared.UpdateComponentData) {
  switch (`${updateData.type}-${updateData.operation}`) {
    case 'plugin-set': {
      const typedUpdate = updateData as shared.SetPluginData;
      const plugin: Plugin = { instanceName: typedUpdate.instanceName, ...typedUpdate.data };
      return setPlugin({ plugin });
    }

    case 'plugin-clear': {
      const typedUpdate = updateData as shared.ClearData;
      return clearPlugin({ instanceName: typedUpdate.instanceName, id: typedUpdate.id });
    }

    case 'component-set': {
      const typedUpdate = updateData as shared.SetComponentData;
      const component: Component = { instanceName: typedUpdate.instanceName, ...typedUpdate.data };
      return setComponent({ component });
    }

    case 'component-clear': {
      const typedUpdate = updateData as shared.ClearData;
      return clearComponent({ instanceName: typedUpdate.instanceName, id: typedUpdate.id });
    }

    case 'state-set': {
      const typedUpdate = updateData as shared.SetStateData;
      const state: State = { instanceName: typedUpdate.instanceName, ...typedUpdate.data };
      return setState({ state });
    }

    default:
      throw new Error(`Unsupported server operation: ${updateData.type}-${updateData.operation}`);
  }
}
