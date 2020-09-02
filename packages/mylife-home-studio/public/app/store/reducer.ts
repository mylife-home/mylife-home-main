import { combineReducers } from 'redux';

import tabs from './tabs/reducer';
import coreDesigner from './core-designer/reducer';

export default combineReducers({
  tabs,
  coreDesigner,
});
