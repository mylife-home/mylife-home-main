import { combineReducers } from 'redux';

import status from './status/reducer';
import tabs from './tabs/reducer';
import coreDesigner from './core-designer/reducer';
import onlineLogsView from './online-logs-view/reducer';

export default combineReducers({
  status,
  tabs,
  coreDesigner,
  onlineLogsView,
});
