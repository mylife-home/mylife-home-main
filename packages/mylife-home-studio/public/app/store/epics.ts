import { combineEpics } from 'redux-observable';
import status from './status/epics';
import onlineLogsView from './online-logs-view/epics';
import onlineInstancesView from './online-instances-view/epics';

export default combineEpics(status, onlineLogsView, onlineInstancesView);
