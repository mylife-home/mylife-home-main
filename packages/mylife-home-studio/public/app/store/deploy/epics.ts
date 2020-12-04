import { Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { from, Observable, range, zip } from 'rxjs';
import { concatMap, ignoreElements, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import * as shared from '../../../../shared/deploy';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { setNotification, clearNotification, pushUpdates, uploadFilesProgress, downloadFileProgress } from './actions';
import { hasDeployTab, getNotifierId, getFile } from './selectors';
import { handleError } from '../common/rx-operators';
import { createNotifierEpic } from '../common/notifier-epic';
import { ActionTypes, AddRunLog, ClearFile, ClearRecipe, ClearRun, FileInfo, PinRecipe, RecipeConfig, Run, RunLog, SetFile, SetRecipe, SetRun, SetTask, Update } from './types';
import { uploadFile, downloadFile } from './rx-files';


const notifierEpic = createNotifierEpic({
  notificationType: 'deploy/updates',
  startNotifierService: 'deploy/start-notify',
  stopNotifierService: 'deploy/stop-notify',
  getNotifierId,
  hasTypedTab: hasDeployTab,
  setNotification,
  clearNotification,
  applyUpdates: pushUpdates,
  parseUpdate: parseNotification,
});

const setRecipeEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.SET_RECIPE),
    mergeMap((action: PayloadAction<{ id: string; config: RecipeConfig; }>) => setRecipeCall(action.payload).pipe(ignoreElements(), handleError()))
  );

const clearRecipeEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.CLEAR_RECIPE),
    mergeMap((action: PayloadAction<string>) => clearRecipeCall(action.payload).pipe(ignoreElements(), handleError()))
  );

const pinRecipeEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.PIN_RECIPE),
    mergeMap((action: PayloadAction<{ id: string; value: boolean; }>) => pinRecipeCall(action.payload).pipe(ignoreElements(), handleError()))
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

const uploadFilesEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.UPLOAD_FILES),
    // cannot handle concurrent uploads
    concatMap((action: PayloadAction<File[]>) => uploadFiles(action.payload))
  );

const downloadFileEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.DOWNLOAD_FILE),
    withLatestFrom(state$),
    map(([action, state]: [PayloadAction<string>, AppState]) => getFile(state, action.payload)),
    // cannot handle concurrent downloads
    concatMap((file: FileInfo) => downloadFile(file.id, file.size).pipe(
      map(fileProgress => downloadFileProgress(fileProgress.doneSize))
    ))
  );

const deleteFileEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.DELETE_FILE),
    mergeMap((action: PayloadAction<string>) => deleteFileCall(action.payload).pipe(ignoreElements(), handleError()))
  );

const renameFileEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(ActionTypes.RENAME_FILE),
    mergeMap((action: PayloadAction<{ id: string; newId: string; }>) => renameFileCall(action.payload).pipe(ignoreElements(), handleError()))
  );

export default combineEpics(notifierEpic, setRecipeEpic, clearRecipeEpic, pinRecipeEpic, startRecipeEpic, uploadFilesEpic, downloadFileEpic, deleteFileEpic, renameFileEpic);

function setRecipeCall({ id, config }: { id: string; config: shared.RecipeConfig; }) {
  return socket.call('deploy/set-recipe', { id, config }) as Observable<void>;
}

function clearRecipeCall(id: string) {
  return socket.call('deploy/clear-recipe', { id }) as Observable<void>;
}

function pinRecipeCall({ id, value }: { id: string; value: boolean; }) {
  return socket.call('deploy/pin-recipe', { id, value }) as Observable<void>;
}

function startRecipeCall(id: string) {
  return socket.call('deploy/start-recipe', { id }) as Observable<string>;
}

function deleteFileCall(id: string) {
  return socket.call('deploy/delete-file', { id }) as Observable<void>;
}

function renameFileCall({ id, newId }: { id: string; newId: string; }) {
  return socket.call('deploy/rename-file', { id, newId }) as Observable<void>;
}

function uploadFiles(files: File[]) {
  const index$ = range(0, files.length);
  const files$ = from(files);

  return zip(files$, index$).pipe(
    concatMap(([file, fileIndex]) => uploadFile(file).pipe(
      map(fileProgress => uploadFilesProgress({ fileIndex, doneSize: fileProgress.doneSize }))
    ))
  );
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
