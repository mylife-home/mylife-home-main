import { combineEpics } from 'redux-observable';
import status from './status/epics';

export default combineEpics(status);
