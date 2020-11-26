import { Action } from 'redux';
import { Observable, } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { combineEpics } from 'redux-observable';

import { socket, BeginRequestEvent, EndRequestEvent } from '../common/rx-socket';
import { online, beginRequest, endRequest } from './actions';

const socketOnlineEpic = (action$: Observable<Action>) => socket.online().pipe(map(online));

const socketBeginRequestEpic = (action$: Observable<Action>) => socket.request().pipe(
  filter((event) => event.type === 'begin'),
  map((event: BeginRequestEvent) => beginRequest({ id: event.id, service: event.service }))
);

const socketEndRequestEpic = (action$: Observable<Action>) => socket.request().pipe(
  filter((event) => event.type === 'end'),
  map((event: EndRequestEvent) => endRequest(event.id))
);

export default combineEpics(socketOnlineEpic, socketBeginRequestEpic, socketEndRequestEpic);