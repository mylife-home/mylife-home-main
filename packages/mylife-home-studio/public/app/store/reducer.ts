import { combineReducers } from 'redux';

import status from './status/reducer';
import tabs from './tabs/reducer';
import coreDesigner from './core-designer/reducer';
import onlineLogs from './online-logs/reducer';
import onlineHistory from './online-history/reducer';
import onlineInstancesView from './online-instances-view/reducer';
import onlineComponentsView from './online-components-view/reducer';

export default combineReducers({
  status,
  tabs,
  coreDesigner,
  onlineLogs,
  onlineHistory,
  onlineInstancesView,
  onlineComponentsView,
});
