import { combineReducers } from 'redux';

import status from './status/reducer';
import tabs from './tabs/reducer';
import coreDesigner from './core-designer/reducer';

export default combineReducers({
  status,
  tabs,
  coreDesigner,
});
