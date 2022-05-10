import { StateObservable } from 'redux-observable';
import { asyncScheduler, Observable, of, Operator, OperatorFunction, SchedulerLike, Subscriber, Subscription, TeardownLogic } from 'rxjs';

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
export function bufferDebounceTime<T>(time: number): OperatorFunction<T, T[]> {
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

// taken from https://github.com/ReactiveX/rxjs/blob/6.6.3/src/internal/operators/debounceTime.ts
/**
 * Debounce the actions.
 * If the key is null, the action is not debounced.
 * If the key is the same than prev, the action is debounced.
 * If key is null or different, the debounce is stopped, and the pending action is emitted BEFORE the resetting action
 * 
 * @param keyBuilder 
 * @param valueMerger 
 * @param dueTime
 * @param scheduler
 */
export function debounceTimeKey<T>(keyBuilder: (value: T) => string, valueMerger: (prevValue: T, newValue: T) => T, dueTime: number, scheduler: SchedulerLike = asyncScheduler) {
  return (source: Observable<T>) => source.lift(new DebounceTimeKeyOperator(keyBuilder, valueMerger, dueTime, scheduler));
}

class DebounceTimeKeyOperator<T> implements Operator<T, T> {
  constructor(
    private readonly keyBuilder: (value: T) => string,
    private readonly valueMerger: (prevValue: T, newValue: T) => T,
    private readonly dueTime: number,
    private readonly scheduler: SchedulerLike) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DebounceTimeKeySubscriber(subscriber, this.keyBuilder, this.valueMerger, this.dueTime, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DebounceTimeKeySubscriber<T> extends Subscriber<T> {
  private debouncedSubscription: Subscription = null;

  private lastValue: T = null;
  private lastKey: string = null;
  private hasValue: boolean = false;

  constructor(
    destination: Subscriber<T>,
    private readonly keyBuilder: (value: T) => string,
    private readonly valueMerger: (prevValue: T, newValue: T) => T,
    private readonly dueTime: number,
    private readonly scheduler: SchedulerLike) {
    super(destination);
  }

  protected _next(value: T) {
    const key = this.keyBuilder(value);

    if (this.hasValue && this.lastKey !== key) {
      this.debouncedNext();
    }

    if (!key) {
      // no key => no debouncing
      // Note: seems that order is not respected if we do not do that ?!
      setTimeout(() => this.destination.next(value), 0);
      return;
    }

    this.clearDebounce();

    if (this.hasValue) {
      this.lastValue = this.valueMerger(this.lastValue, value);
    } else {
      this.lastValue = value;
    }

    this.lastKey = key;
    this.hasValue = true;
    this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
  }

  protected _complete() {
    this.debouncedNext();
    this.destination.complete();
  }

  debouncedNext() {
    this.clearDebounce();

    if (this.hasValue) {
      const { lastValue } = this;
      // This must be done *before* passing the value
      // along to the destination because it's possible for
      // the value to synchronously re-enter this operator
      // recursively when scheduled with things like
      // VirtualScheduler/TestScheduler.
      this.hasValue = false;
      this.lastValue = null;
      this.lastKey = null;
      this.destination.next(lastValue);
    }
  }

  private clearDebounce(): void {
    const debouncedSubscription = this.debouncedSubscription;

    if (debouncedSubscription !== null) {
      this.remove(debouncedSubscription);
      debouncedSubscription.unsubscribe();
      this.debouncedSubscription = null;
    }
  }
}

function dispatchNext(subscriber: DebounceTimeKeySubscriber<unknown>) {
  subscriber.debouncedNext();
}