import { combineReducers } from 'redux';

import status from './status/reducer';
import tabs from './tabs/reducer';
import projectsList from './projects-list/reducer';
import coreDesigner from './core-designer/reducer';
import uiDesigner from './ui-designer/reducer';
import onlineLogs from './online-logs/reducer';
import onlineHistory from './online-history/reducer';
import onlineInstancesView from './online-instances-view/reducer';
import onlineComponentsView from './online-components-view/reducer';
import deploy from './deploy/reducer';

export default combineReducers({
  status,
  tabs,
  projectsList,
  coreDesigner,
  uiDesigner,
  onlineLogs,
  onlineHistory,
  onlineInstancesView,
  onlineComponentsView,
  deploy,
});
