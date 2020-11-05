import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import * as shared from '../../../../shared/deploy';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { setNotification, clearNotification, pushUpdates } from './actions';
import { hasDeployTab, getNotifierId } from './selectors';
import { bufferDebounceTime, filterNotification, handleError, withSelector } from '../common/rx-operators';
import { AddRunLog, ClearRecipe, ClearRun, PinRecipe, Run, RunLog, SetRecipe, SetRun, SetTask, Update } from './types';

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

function parseNotification(notification: shared.UpdateDataNotification): Update {
  switch (notification.operation) {
    case 'task-set': {
      const typedNotification = notification as shared.SetTaskNotification;
      const update: SetTask = {
        operation: 'task-set',
        task: {
          name: typedNotification.name,
          metadata: typedNotification.metadata
        }
      };
      return update;
    }

    case 'recipe-set': {
      const typedNotification = notification as shared.SetRecipeNotification;
      const update: SetRecipe = {
        operation: 'recipe-set',
        recipe: {
          name: typedNotification.name,
          config: typedNotification.config
        }
      };
      return update;
    }

    case 'recipe-clear': {
      const typedNotification = notification as shared.ClearRecipeNotification;
      const update: ClearRecipe = {
        operation: 'recipe-clear',
        name: typedNotification.name
      };
      return update;
    }

    case 'recipe-clear': {
      const typedNotification = notification as shared.PinRecipeNotification;
      const update: PinRecipe = {
        operation: 'recipe-pin',
        name: typedNotification.name,
        value: typedNotification.value
      };
      return update;
    }

    case 'run-set': {
      const typedNotification = notification as shared.SetRunNotification;
      const update: SetRun = {
        operation: 'run-set',
        run: parseRun(typedNotification.run)
      };
      return update;
    }

    case 'run-clear': {
      const typedNotification = notification as shared.ClearRunNotification;
      const update: ClearRun = {
        operation: 'run-clear',
        id: typedNotification.id
      };
      return update;
    }

    case 'run-add-log': {
      const typedNotification = notification as shared.AddRunLogNotification;
      const update: AddRunLog = {
        operation: 'run-add-log',
        id: typedNotification.id,
        log: parseRunLog(typedNotification.log)
      };
      return update;
    }
  }
}

function parseRun(run: shared.Run): Run {
  const { creation, end, logs, ...props } = run;
  return {
    ...props,
    creation: new Date(creation),
    end: new Date(end),
    logs: logs && logs.map(parseRunLog),
  };
}

function parseRunLog(log: shared.RunLog): RunLog {
  const { date, ...props } = log;
  return { ...props, date: new Date(date) };
}
