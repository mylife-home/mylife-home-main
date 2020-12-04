import { Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { Observable } from 'rxjs';
import { ignoreElements, mergeMap } from 'rxjs/operators';
import { ofType, StateObservable } from 'redux-observable';

import { handleError } from '../common/rx-operators';
import { socket } from '../common/rx-socket';
import { AppState } from '../types';

/**
 * create a socket call epic with no call result, and with the payload as call argument
 */
export function createSocketCallEpic<TActionType, TActionPayload = any, TServicePayload extends {} = any>(actionType: TActionType, service: string, mapper: (payload: TActionPayload) => TServicePayload = (payload) => payload as any) {
  return (action$: Observable<Action>, state$: StateObservable<AppState>) =>
    action$.pipe(
      ofType(actionType),
      mergeMap((action: PayloadAction<TActionPayload>) => socketCall(service, mapper(action.payload)).pipe(ignoreElements(), handleError()))
    );
}

function socketCall<TPayload>(service: string, payload: TPayload) {
  return socket.call('project-manager/import-v1', payload) as Observable<void>;
}
