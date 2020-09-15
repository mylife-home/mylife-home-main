import { Action } from 'redux';
import { Observable,  } from 'rxjs';
import { filter, ignoreElements, map, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import { socket } from '../common/rx-socket';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes } from '../tabs/types';
import { hasOnlineLogsViewTabCount, hasNotifications } from './selectors';

const fetchEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => action$.pipe(
  ofType(TabActionTypes.NEW, TabActionTypes.CLOSE),
  withLatestFrom(state$),
  filter(([, state]) => xor(hasOnlineLogsViewTabCount(state), hasNotifications(state))),
  ignoreElements() // TODO
);

export default combineEpics(fetchEpic);

function xor(a: boolean, b: boolean) {
  return a && !b || !a && b;
}