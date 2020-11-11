import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter, ignoreElements, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import * as shared from '../../../../shared/deploy';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { setNotification, clearNotification, pushUpdates, setRecipe } from './actions';
import { hasDeployTab, getNotifierId } from './selectors';
import { bufferDebounceTime, filterNotification, handleError, withSelector } from '../common/rx-operators';
import { ActionTypes, AddRunLog, ClearFile, ClearRecipe, ClearRun, FileInfo, PinRecipe, RecipeConfig, Run, RunLog, SetFile, SetRecipe, SetRun, SetTask, Update } from './types';
import { PayloadAction } from '@reduxjs/toolkit';

const startNotifyUpdatesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    filterNotifyChange(state$),
    withSelector(state$, getNotifierId),
    filter(([, notifierId]) => !notifierId),
    mergeMap(() =>
      startNotifyCall().pipe(
        map(({ notifierId }) => setNotification(notifierId)),
        handleError()
      )
    )
  );

const stopNotifyUpdatesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    filterNotifyChange(state$),
    withSelector(state$, getNotifierId),
    filter(([, notifierId]) => !!notifierId),
    mergeMap(([, notifierId]) =>
      stopNotifyCall({ notifierId }).pipe(
        map(() => clearNotification()),
        handleError()
      )
    )
  );

const fetchUpdatesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
  const notification$ = socket.notifications();
  return notification$.pipe(
    filterNotification('deploy/updates'),
    withSelector(state$, getNotifierId),
    filter(([notification, notifierId]) => notification.notifierId === notifierId),
    map(([notification]) => parseNotification(notification.data)),
    bufferDebounceTime(100), // debounce to avoid multiple store updates
    map((items) => pushUpdates(items))
  );
};

const setRecipeEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.SET_RECIPE),
    mergeMap((action: PayloadAction<{ id: string; config: RecipeConfig }>) => setRecipeCall(action.payload).pipe(ignoreElements(), handleError()))
  );

const clearRecipeEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.CLEAR_RECIPE),
    mergeMap((action: PayloadAction<string>) => clearRecipeCall(action.payload).pipe(ignoreElements(), handleError()))
  );

const pinRecipeEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.PIN_RECIPE),
    mergeMap((action: PayloadAction<{ id: string; value: boolean }>) => pinRecipeCall(action.payload).pipe(ignoreElements(), handleError()))
  );

const startRecipeEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.START_RECIPE),
    mergeMap((action: PayloadAction<string>) =>
      startRecipeCall(action.payload).pipe(
        // string result: new run id
        ignoreElements(),
        handleError()
      )
    )
  );

// TODO: files api

export default combineEpics(startNotifyUpdatesEpic, stopNotifyUpdatesEpic, fetchUpdatesEpic, setRecipeEpic, clearRecipeEpic, pinRecipeEpic, startRecipeEpic);

function filterNotifyChange(state$: StateObservable<AppState>) {
  return (source: Observable<Action>) =>
    source.pipe(
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
  return (a && !b) || (!a && b);
}

function startNotifyCall() {
  return socket.call('deploy/start-notify', null) as Observable<{ notifierId: string }>;
}

function stopNotifyCall({ notifierId }: { notifierId: string }) {
  return socket.call('deploy/stop-notify', { notifierId }) as Observable<void>;
}

function setRecipeCall({ id, config }: { id: string; config: shared.RecipeConfig }) {
  return socket.call('deploy/set-recipe', { id, config }) as Observable<void>;
}

function clearRecipeCall(id: string) {
  return socket.call('deploy/clear-recipe', { id }) as Observable<void>;
}

function pinRecipeCall({ id, value }: { id: string; value: boolean }) {
  return socket.call('deploy/pin-recipe', { id, value }) as Observable<void>;
}

function startRecipeCall(id: string) {
  return socket.call('deploy/start-recipe', { id }) as Observable<string>;
}

function parseNotification(notification: shared.UpdateDataNotification): Update {
  switch (notification.operation) {
    case 'task-set': {
      const typedNotification = notification as shared.SetTaskNotification;
      const update: SetTask = {
        operation: 'task-set',
        task: {
          id: typedNotification.id,
          metadata: typedNotification.metadata,
        },
      };
      return update;
    }

    case 'recipe-set': {
      const typedNotification = notification as shared.SetRecipeNotification;
      const update: SetRecipe = {
        operation: 'recipe-set',
        recipe: {
          id: typedNotification.id,
          config: typedNotification.config,
          pinned: null, // on set recipe we don't have this info
        },
      };
      return update;
    }

    case 'recipe-clear': {
      const typedNotification = notification as shared.ClearRecipeNotification;
      const update: ClearRecipe = {
        operation: 'recipe-clear',
        id: typedNotification.id,
      };
      return update;
    }

    case 'recipe-pin': {
      const typedNotification = notification as shared.PinRecipeNotification;
      const update: PinRecipe = {
        operation: 'recipe-pin',
        id: typedNotification.id,
        value: typedNotification.value,
      };
      return update;
    }

    case 'run-set': {
      const typedNotification = notification as shared.SetRunNotification;
      const update: SetRun = {
        operation: 'run-set',
        run: parseRun(typedNotification.run),
      };
      return update;
    }

    case 'run-clear': {
      const typedNotification = notification as shared.ClearRunNotification;
      const update: ClearRun = {
        operation: 'run-clear',
        id: typedNotification.id,
      };
      return update;
    }

    case 'run-add-log': {
      const typedNotification = notification as shared.AddRunLogNotification;
      const update: AddRunLog = {
        operation: 'run-add-log',
        id: typedNotification.id,
        log: parseRunLog(typedNotification.log),
      };
      return update;
    }

    case 'file-set': {
      const typedNotification = notification as shared.SetFileNotification;
      const update: SetFile = {
        operation: 'file-set',
        file: parseFile(typedNotification.file),
      };
      return update;
    }

    case 'file-clear': {
      const typedNotification = notification as shared.ClearFileNotification;
      const update: ClearFile = {
        operation: 'file-clear',
        id: typedNotification.id,
      };
      return update;
    }
  }
}

function parseRun(run: shared.Run): Run {
  const { creation, end, logs, ...props } = run;
  return {
    ...props,
    creation: parseDate(creation),
    end: parseDate(end),
    logs: logs && logs.map(parseRunLog),
  };
}

function parseRunLog(log: shared.RunLog): RunLog {
  const { date, ...props } = log;
  return { ...props, date: new Date(date) };
}

function parseFile(file: shared.FileInfo): FileInfo {
  const { modifiedDate, ...props } = file;
  return {
    ...props,
    modifiedDate: parseDate(modifiedDate),
  };
}

function parseDate(value: number) {
  return value == null ? null : new Date(value);
}
