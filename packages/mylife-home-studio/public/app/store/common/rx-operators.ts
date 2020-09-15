import { Action } from 'redux';
import { StateObservable } from 'redux-observable';
import { Observable, of } from 'rxjs';
import { catchError, map, withLatestFrom } from 'rxjs/operators';
import { setError } from '../status/actions';
import { AppState } from '../types';

export function handleError() {
  return catchError(error => of(setError(error)));
}

export function withSelector<SelectorReturnType, ActionReturnType>(state$: StateObservable<AppState>, selector: (state: AppState) => SelectorReturnType) {
  return (source: Observable<ActionReturnType>) => source.pipe(
    withLatestFrom(state$),
    map(([action, state]) => ([action, selector(state)] as [ActionReturnType, SelectorReturnType]))
  );
}