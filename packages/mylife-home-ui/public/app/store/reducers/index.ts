import { combineReducers } from 'redux';

import online from './online';
import repository from './repository';
import resources from './resources';
import view from './view';
import model from './model';

export default combineReducers({
  online,
  repository,
  resources,
  view,
  model
});
