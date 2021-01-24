import { Middleware } from 'redux';
import { createAction } from '@reduxjs/toolkit';
import { Deferred } from '../../components/lib/deferred'; // TODO: should not import here

export interface DeferredPayload<Result> { 
  promise: Promise<Result>;
  reject: (reason: Error) => void;
  resolve: (value: Result) => void;
}

export function createAsyncAction<Payload = void, Result = void, Type extends string = string>(type: Type) {
  const action = createAction<Payload & DeferredPayload<Result>, Type>(type);

  return (payload: Payload) => {
    const deferred = new Deferred<Result>();

    const { promise } = deferred;
    const reject = (reason: Error) => deferred.reject(reason);
    const resolve = (value: Result) => deferred.resolve(value);

    const newPayload = { ...payload, promise, reject, resolve };

    return action(newPayload);
  }
}

export const asyncActionMiddleware: Middleware = store => next => action => {
  const result = next(action);
  const promise = action.payload?.promise;
  return promise || result;
}