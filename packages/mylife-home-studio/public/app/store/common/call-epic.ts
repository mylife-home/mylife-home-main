import { Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { Observable, OperatorFunction } from 'rxjs';
import { ignoreElements, map, mergeMap, tap, withLatestFrom} from 'rxjs/operators';
import { ofType, StateObservable } from 'redux-observable';

import { DeferredPayload } from './async-action';
import { handleError } from '../common/rx-operators';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';

/**
 * create a socket call epic with no call result, and with the payload as call argument
 */
export function createSocketCallEpic<TActionType, TServiceResult = void, TActionResult = TServiceResult, TActionPayload extends DeferredPayload<TActionResult> = any, TServicePayload extends {} = any>(
  actionType: TActionType,
  service: string,
  mapper: (payload: TActionPayload, state: AppState) => TServicePayload = defaultMapper,
  resultMapper: (result: TServiceResult) => TActionResult = defaultResultMapper,
  outputProcessor: OperatorFunction<TActionResult, any> = ignoreElements()
) {
  return (action$: Observable<Action>, state$: StateObservable<AppState>) =>
    action$.pipe(
      ofType(actionType),
      withLatestFrom(state$),
      mergeMap(([action, state]: [PayloadAction<TActionPayload>, AppState]) => socketCall(service, mapper(action.payload, state)).pipe(
        map(resultMapper),
        tap((result: TActionResult) => { action.payload.resolve(result); }),
        outputProcessor,
        handleError()
      ))
    );
}

function socketCall<TResult, TPayload>(service: string, payload: TPayload) {
  return socket.call(service, payload) as Observable<TResult>;
}

function defaultMapper<TServicePayload, TActionPayload extends DeferredPayload<unknown>>(payload: TActionPayload) {
  const { resolve, reject, promise, ...other } = payload;
  return (other as unknown) as TServicePayload;
}

function defaultResultMapper<TActionResult, TServiceResult>(result: TServiceResult) {
  return (result as unknown) as TActionResult;
}