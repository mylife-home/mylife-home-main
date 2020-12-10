import { Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { Observable, OperatorFunction } from 'rxjs';
import { ignoreElements, mergeMap } from 'rxjs/operators';
import { ofType, StateObservable } from 'redux-observable';

import { handleError } from '../common/rx-operators';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';

/**
 * create a socket call epic with no call result, and with the payload as call argument
 */
export function createSocketCallEpic<TActionType, TServiceResult = void, TActionResult = never, TActionPayload = any, TServicePayload extends {} = any>(
  actionType: TActionType,
  service: string,
  mapper: (payload: TActionPayload) => TServicePayload = (payload) => payload as any,
  resultProcessor: OperatorFunction<TServiceResult, TActionResult> = ignoreElements()) {
  return (action$: Observable<Action>, state$: StateObservable<AppState>) =>
    action$.pipe(
      ofType(actionType),
      mergeMap((action: PayloadAction<TActionPayload>) => socketCall(service, mapper(action.payload)).pipe(resultProcessor, handleError()))
    );
}

function socketCall<TResult, TPayload>(service: string, payload: TPayload) {
  return socket.call(service, payload) as Observable<TResult>;
}
