import { combineReducers } from 'redux';

import online from './online';
import registry from './registry';
import view from './view';
import model from './model';

export default combineReducers({
  online,
  registry,
  view,
  model
});
