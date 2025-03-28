import { Action } from 'redux';
import reducer from './reducer';

export type AppState = ReturnType<typeof reducer>;

export type AsyncDispatch<Result = void> = (action: Action) => Promise<Result>;