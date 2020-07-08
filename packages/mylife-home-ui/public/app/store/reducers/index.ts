import { combineReducers } from 'redux';

import online from './online';
import repository from './repository';
import view from './view';
import model from './model';

export default combineReducers({
  online,
  repository,
  view,
  model
});
