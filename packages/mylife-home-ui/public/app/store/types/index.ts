import { Action } from 'redux';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import reducer from '../reducers';

export type AppState = ReturnType<typeof reducer>;

export type AppThunkDispatch = ThunkDispatch<AppState, void, Action>;
export type AppThunkAction<R = void> = ThunkAction<R, AppState, void, Action>;
