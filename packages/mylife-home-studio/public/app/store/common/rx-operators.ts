import { StateObservable } from 'redux-observable';
import { Observable, of, OperatorFunction } from 'rxjs';
import { catchError, debounceTime, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { Notification } from '../../../../shared/protocol';
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

// https://stackblitz.com/edit/rxjs-buffer-with-debounce
export function bufferDebounceTime<T>(time: number = 0): OperatorFunction<T, T[]> {
  return (source: Observable<T>) => {
    let bufferedValues: T[] = [];

    return source.pipe(
      tap(value => bufferedValues.push(value)),
      debounceTime(time),
      map(() => bufferedValues),
      tap(() => bufferedValues = []),
    );
  };
}

export function filterNotification(type: string) {
  return (source: Observable<Notification>) => source.pipe(
    filter(notification => notification.notifierType === type)
  );
}

export function filterFromState<ActionType>(state$: StateObservable<AppState>, predicate: (state: AppState, action: ActionType) => boolean) {
  return (source: Observable<ActionType>) => source.pipe(
    withLatestFrom(state$),
    filter(([action, state]) => predicate(state, action)),
    map(([action]) => action)
  );
}