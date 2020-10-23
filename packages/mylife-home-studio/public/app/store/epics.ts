import { combineEpics } from 'redux-observable';
import status from './status/epics';
import onlineLogs from './online-logs/epics';
import onlineHistory from './online-history/epics';
import onlineInstancesView from './online-instances-view/epics';
import onlineComponentsView from './online-components-view/epics';

export default combineEpics(status, onlineLogs, onlineHistory, onlineInstancesView, onlineComponentsView);
