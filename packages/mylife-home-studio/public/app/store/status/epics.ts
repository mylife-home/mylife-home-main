import { Action } from 'redux';
import { Observable,  } from 'rxjs';
import { map } from 'rxjs/operators';
import { combineEpics } from 'redux-observable';

import { socket } from '../common/rx-socket';
import { online } from './actions';

const socketOnlineEpic = (action$: Observable<Action>) => socket.online().pipe(map(online));

export default combineEpics(socketOnlineEpic);