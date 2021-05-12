import { combineEpics } from 'redux-observable';
import status from './status/epics';
import projectsList from './projects-list/epics';
import coreDesigner from './core-designer/epics';
import uiDesigner from './ui-designer/epics';
import onlineLogs from './online-logs/epics';
import onlineHistory from './online-history/epics';
import onlineInstancesView from './online-instances-view/epics';
import onlineComponentsView from './online-components-view/epics';
import deploy from './deploy/epics';
import git from './git/epics';

export default combineEpics(status, projectsList, coreDesigner, uiDesigner, onlineLogs, onlineHistory, onlineInstancesView, onlineComponentsView, deploy, git);
