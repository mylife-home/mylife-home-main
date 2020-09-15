import { StateObservable } from 'redux-observable';
import { Observable, of, OperatorFunction } from 'rxjs';
import { catchError, debounceTime, map, tap, withLatestFrom } from 'rxjs/operators';
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
