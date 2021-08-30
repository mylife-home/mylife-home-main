import { combineReducers } from 'redux';

import status from './status/reducer';
import tabs from './tabs/reducer';
import projectsList from './projects-list/reducer';
import coreDesigner from './core-designer/reducer';
import uiDesigner from './ui-designer/reducer';
import onlineStatus from './online-status/reducer';
import onlineLogs from './online-logs/reducer';
import onlineHistory from './online-history/reducer';
import onlineInstancesView from './online-instances-view/reducer';
import onlineComponentsView from './online-components-view/reducer';
import deploy from './deploy/reducer';
import git from './git/reducer';

export default combineReducers({
  status,
  tabs,
  projectsList,
  coreDesigner,
  uiDesigner,
  onlineStatus,
  onlineLogs,
  onlineHistory,
  onlineInstancesView,
  onlineComponentsView,
  deploy,
  git,
});
